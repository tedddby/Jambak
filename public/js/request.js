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
            alert("Internal Server Error");
            return null;
        }

        const responseData = await response.json();

        if (responseData.success) {
            dataReturn = responseData;
        } else {
            alert("Something went wrong");
            return null;
        }
    } catch (error) {
        alert("Something went wrong");
        console.error('Error:', error);
        return null;
    }
    return dataReturn;
}

let requests = [];

function getRelativeTime(timestamp) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - timestamp) / 1000);

    if (diffInSeconds < 60) {
        return `قبل ${diffInSeconds} ثواني`;
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `قبل ${minutes} دقائق`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `قبل ${hours} ساعات`;
    } else {
        const days = Math.floor(diffInSeconds / 86400);
        return `قبل ${days} ايام`;
    }
}

let loadRequests = async () => {
    let fetch = await fetchData('./api/fetch/request', {});
    let data = fetch.data;
    if(data.length > 0){
        for(let i = 0; i < data.length; i++){
            let obj = {
                category: data[i].HelpCategory,
                description: data[i].HelpDescription,
                contact: data[i].ContactInfo,
                location: data[i].HelpLocation,
                urgency: data[i].UrgencyLevel,
                date: getRelativeTime(new Date(data[i].RequestDate))
            }
            requests.push(obj);
        }
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    await loadRequests();
});

function showSection(sectionId) {
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

let handleSubmit = async (event) => {
    event.preventDefault();

    let dataPost = {
        HelpCategory: document.getElementById('helpCategory').value,
        HelpDescription: document.getElementById('helpDescription').value,
        ContactInfo: document.getElementById('requesterContact').value,
        HelpLocation: document.getElementById('helpLocation').value,
        UrgencyLevel: document.getElementById('urgencyLevel').value,
        SupportingDocument: document.getElementById('supportingDocument').value
    };

    let req = await fetchData('./api/add/request', dataPost);
    if (req.success) {
        alert("تم اضافة الطلب");
        window.location.reload();
    }else{
        alert("Something went wrong");
    }
}

function displayRequests() {
    const grid = document.getElementById('requestsGrid');

    if(requests.length === 0){
        document.getElementById("notFound").style.display = '';
    }else{
        grid.innerHTML = '';
        requests.forEach(request => {
            const card = document.createElement('div');
            card.className = 'request-card';

            const urgencyColor = {
                'ما مستعجل': '#28a745',
                'شبه مستعجل': '#ffc107',
                'مستعجل': '#fd7e14',
                'مستعجل جدا': '#dc3545'
            };

            card.innerHTML = `
      <span class="request-category" style="background-color: ${urgencyColor[request.urgency]}">
        ${request.category} - ${request.urgency}
      </span>
      <p class="request-description" dir="rtl">${request.description}</p>
      <div class="request-details">
        <p dir="rtl">📍 موقع الطلب: ${request.location}</p>
        <p dir="rtl">📅 موعد الطلب: ${request.date}</p>
        <p dir="rtl">📧 معلومات التواصل: ${request.contact}</p>
      </div>
      <button class="help-btn" onclick="offerHelp('${request.contact}')">قدم المساعدة</button>
    `;

            grid.appendChild(card);
        });
    }
}

function offerHelp(contact) {
    alert(`اتواصل مع مقدم الطلب في: ${contact}`);
}

window.onload = () => {
    setTimeout(() => {
        showSection('requestsList');
    }, 500);
};