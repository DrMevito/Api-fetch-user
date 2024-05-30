async function createUser(email, password) {
    console.log('Creating user with email:', email);
    const response = await fetch('https://deba-debnath.pockethost.io/api/collections/users/records', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: email,
            password: password,
            passwordConfirm: password
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
    }

    return await response.json();
}

async function authenticateUser(email, password) {
    console.log('Authenticating user with email:', email);
    const response = await fetch('https://deba-debnath.pockethost.io/api/collections/users/auth-with-password', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            identity: email,
            password: password
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
    }

    return await response.json();
}

document.getElementById('createUserForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    console.log('Create user form submitted');
    const email = document.getElementById('createEmail').value;
    const password = document.getElementById('createPassword').value;

    try {
        const user = await createUser(email, password);
        console.log('User created successfully:', user);
    } catch (error) {
        console.error('Error creating user:', error);
    }
});

document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    console.log('Login form submitted');
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const authResponse = await authenticateUser(email, password);
        localStorage.setItem('authToken', authResponse.token);
        console.log('User authenticated successfully:', authResponse);
    } catch (error) {
        console.error('Authentication failed:', error);
    }
});

document.getElementById('getUserData').addEventListener('click', async function() {
    console.log('Fetch user data button clicked');
    const token = localStorage.getItem('authToken');
    
    if (!token) {
        console.error('No auth token found, please log in first.');
        return;
    }

    try {
        const response = await fetch('https://deba-debnath.pockethost.io/api/collections/users/records', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message);
        }

        const userData = await response.json();
        document.getElementById('userData').textContent = JSON.stringify(userData, null, 2);
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
});
