async function fetchData(url, requestData) {
    let dataReturn;
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData),
        });

        if (!response.ok) {
            console.log(response)
        }

        const responseData = await response.json();
        dataReturn = responseData;
    } catch (error) {
        alert("Something went wrong");
        console.error('Error:', error);
        return null;
    }
    return dataReturn;
}

let showSection = (sectionId) => {
    document.querySelectorAll('.section').forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById(sectionId).style.display = 'block';

    document.querySelectorAll('.section-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    const activeButton = Array.from(document.querySelectorAll('.section-btn'))
        .find(btn => btn.onclick.toString().includes(sectionId));
    if (activeButton) {
        activeButton.classList.add('active');
    }

    if (sectionId === 'requestsList') {
        displayRequests();
    }
}

let handleSubmit = async (form, event) => {
    if(form === "login"){
        event.preventDefault();
        let dataPost = {
            phoneNumber: document.getElementById('phoneNumber').value,
            password: document.getElementById('password').value
        }

        let req = await fetchData('./api/auth/login', dataPost);
        if(req.success){
            alert("تم تسجيل الدخول");
            let urlParams = new URLSearchParams(window.location.search);
            let redirectTo = urlParams.get('redirectTo');
            if(redirectTo) {
                window.location.href = redirectTo;
            }else{
                return window.location.reload();
            }
        }else{
            return alert("معليش: \n"+req.message)
        }
    }else if(form === "register"){
        event.preventDefault();
        let dataPost = {
            name: document.getElementById('name').value,
            phoneNumber: document.getElementById('phoneNumberreg').value,
            mBOK: document.getElementById('mBOK').value,
            location: document.getElementById('location').value,
            password: document.getElementById('passwordreg').value
        }

        let req = await fetchData('./api/auth/register', dataPost);
        if(req.success){
            alert("تم التسجيل بنجاح, سجل دخول");
            return window.location.reload();
        }else{
            return alert("معليش: \n"+req.message)
        }
    }else if(form === "logout"){
        event.preventDefault();
        window.location.href = "./api/auth/logout";
    }
}

window.onload = () => {
    if(document.getElementById('details').getAttribute("data-loaded") !== ""){
        showSection('details');
        document.querySelectorAll('.section-btn').forEach(btn => {
            btn.style.display = 'none';
        })
    }else{
        let urlParams = new URLSearchParams(window.location.search);
        let redirectTo = urlParams.get('redirectTo');
        if(redirectTo) {
            alert("يجب تسجيل الدخول اولاً لزيارة بقية الصفحات.")
        }
        showSection('login');
    }
};