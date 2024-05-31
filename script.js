const apiUrl = 'https://deba-debnath.pockethost.io'; // Your PocketHost URL

document.getElementById('login-form').onsubmit = async (event) => {
    event.preventDefault(); // Prevent the form from submitting the traditional way

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    console.log('Login form submitted', email, password); // Debugging

    try {
        const response = await fetch(`${apiUrl}/api/collections/users/auth-with-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                identity: email,
                password: password
            })
        });

        const authResponse = await response.json();
        if (!response.ok) {
            if (authResponse.message.includes('incorrect')) {
                document.getElementById('login-message').textContent = 'Password incorrect. Please try again.';
            } else {
                document.getElementById('login-message').textContent = 'User not registered yet.';
            }
            throw new Error(authResponse.message);
        }

        localStorage.setItem('token', authResponse.token);
        localStorage.setItem('userId', authResponse.record.id);
        localStorage.setItem('userName', authResponse.record.name);
        document.getElementById('login-message').textContent = 'Login successful!';
        showCourses();
    } catch (error) {
        console.error('Login error:', error);
    }
};

document.getElementById('register-form').onsubmit = async (event) => {
    event.preventDefault(); // Prevent the form from submitting the traditional way

    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    console.log('Register form submitted', name, email, password); // Debugging

    try {
        // Check if the user is already registered
        const checkResponse = await fetch(`${apiUrl}/api/collections/users/records?filter=(email='${email}')`, {
            headers: { 'Content-Type': 'application/json' }
        });

        const checkResult = await checkResponse.json();
        if (checkResult.items.length > 0) {
            document.getElementById('register-message').textContent = 'You are already registered.';
            return;
        }

        const response = await fetch(`${apiUrl}/api/collections/users/records`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                email: email,
                password: password,
                passwordConfirm: password
            })
        });

        const registerResponse = await response.json();
        if (!response.ok) {
            throw new Error(registerResponse.message);
        }
    
//Experiment ⭐
document.getElementById('register-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('switch-to-login-btn').style.display = 'none';
   //Experiment ends ⭐    
        document.getElementById('register-message').textContent = 'User registered successfully!';
    } catch (error) {
        console.error('Registration error:', error);
        document.getElementById('register-message').textContent = 'Registration failed. Please try again.';
    }
};

document.getElementById('logout-btn').onclick = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    showLoginForm();
};

document.getElementById('switch-to-login-btn').onclick = () => {
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('switch-to-login-btn').style.display = 'none';
};

//Testing area second 🔚 🔚
document.getElementById('switch-to-register-btn').onclick = () => {
    document.getElementById('register-form').style.display = 'block';
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('switch-to-login-btn').style.display = 'block';
};
//testing area end 🔚 🔚

async function showCourses() {
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');
    const token = localStorage.getItem('token');
    if (!userId || !token) {
        showLoginForm();
        return;
    }
    document.getElementById('course-panel').style.display = 'block';
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('switch-to-login-btn').style.display = 'none';
    document.getElementById('user-name').textContent = userName;

    try {
        const response = await fetch(`${apiUrl}/api/collections/user_courses/records?filter=(userId='${userId}')`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const userCoursesResponse = await response.json();
        if (!response.ok) {
            throw new Error(userCoursesResponse.message);
        }

        const userCourses = userCoursesResponse.items;
        const coursesContainer = document.getElementById('courses-container');
        coursesContainer.innerHTML = '';

        if (userCourses.length === 0) {
            coursesContainer.textContent = 'Nothing is here.';
            return;
        }

        for (const userCourse of userCourses) {
            try {
                const courseResponse = await fetch(`${apiUrl}/api/collections/courses/records/${userCourse.courseId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                    const course = await courseResponse.json();
                    if (!courseResponse.ok) {
                        throw new Error(course.message);
                    }

                    const courseElement = document.createElement('div');
                    courseElement.innerHTML = `<h4>${course.name}</h4><p>${course.description}</p>`;
                    coursesContainer.appendChild(courseElement);

                    // Fetch videos related to this course
                    try {
                        const videosResponse = await fetch(`${apiUrl}/api/collections/videos/records?filter=(courseId~'${course.id}')`, {
                            headers: { Authorization: `Bearer ${token}` }
                        });

                        const videos = await videosResponse.json();
                        if (!videosResponse.ok) {
                            throw new Error(videos.message);
                        }

                        console.log('Videos fetched for courseId:', course.id, 'Videos:', videos.items);

                        const videoList = document.createElement('ul');
                        for (const video of videos.items) {
                            const videoItem = document.createElement('li');
                            videoItem.innerHTML = `<a href="${video.link}" target="_blank">${video.title}</a>`;
                            videoList.appendChild(videoItem);
                        }
                        courseElement.appendChild(videoList);
                    } catch (videoError) {
                        console.error('Error fetching videos for courseId:', course.id, videoError);
                    }
                } catch (courseError) {
                    console.error('Error fetching course details for courseId:', courseId, courseError);
                }
            }
        }
     catch (error) {
        console.error('Error fetching user courses:', error);
    }
}

function showLoginForm() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
    document.getElementById('switch-to-login-btn').style.display = 'block';
    document.getElementById('course-panel').style.display = 'none';
}

// Check if user is already logged in
if (localStorage.getItem('token')) {
    showCourses();
} else {
    showLoginForm();
}
