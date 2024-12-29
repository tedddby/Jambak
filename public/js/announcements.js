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

let truncateString = (str, maxLength) => {
    if (str.length > maxLength) {
        return str.substring(0, maxLength) + "...";
    } else {
        return str;
    }
}

let genAnnouncementCard = (title, description) => {
    let descriptionSummary = truncateString(description, 100);
    let html = `<div class="card">
            <div class="card-header">${title}</div>
            <div class="card-body">
                <p>${descriptionSummary}</p>
            </div>
            <div class="card-footer">
                <button onclick="showPopup(this)" data-title="${title}" data-content="${description}">عرض المزيد</button>
            </div>
        </div>`;
    return html;
}

let loadAnnouncements = async () => {
    let announcementsCont = document.getElementById('announcementsContainer');
    let announcements = await fetchData("./api/fetch/announcement", {});
    if (announcements.data.length > 0) {
        for (let i = 0; i < announcements.data.length; i++) {
            announcementsCont.innerHTML += genAnnouncementCard(announcements.data[i].AnnouncementTitle, announcements.data[i].Description);
        }
    }else{
        announcementsCont.innerHTML = '<p>لا توجد اعلانات...</p>';
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadAnnouncements();
});

function showPopup(button) {
    const title = button.getAttribute('data-title');
    const content = button.getAttribute('data-content');

    document.getElementById('popupTitle').textContent = title;
    document.getElementById('popupContent').textContent = content;
    document.getElementById('popupOverlay').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closePopup() {
    document.getElementById('popupOverlay').style.display = 'none';
    document.body.style.overflow = 'auto';
}

document.getElementById('popupOverlay').addEventListener('click', function(e) {
    if (e.target === this) {
        closePopup();
    }
});