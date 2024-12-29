document.addEventListener("DOMContentLoaded", (event) => {
    document.getElementById("file-area").querySelector("input").addEventListener("change", (e) => {
        const file = e.target.files[0];
        const preview = document.querySelector('.file-preview');
        const previewImage = preview.querySelector('img') || document.createElement('img');

        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                previewImage.src = e.target.result;
                if (!preview.querySelector('img')) {
                    preview.appendChild(previewImage);
                }
                preview.style.display = 'block';
            }
            reader.readAsDataURL(file);
        }
    })
})