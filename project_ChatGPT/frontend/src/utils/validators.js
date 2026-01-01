export const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
};

export const validatePassword = (password) => {
    const minLength = 6;
    return password.length >= minLength;
};

export const validateName = (name) => {
    return name.trim().length > 0;
};

export const validateRegistration = (data) => {
    const { email, firstName, lastName, password } = data;
    return (
        validateEmail(email) &&
        validateName(firstName) &&
        validateName(lastName) &&
        validatePassword(password)
    );
};