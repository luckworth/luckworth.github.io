document.getElementById('copy-btn').addEventListener('click', function() {
    // Select the code text
    const codeText = document.getElementById('code-block').innerText;
    
    // Create a temporary textarea to copy from
    navigator.clipboard.writeText(codeText).then(() => {
        // Visual Feedback
        const btn = this;
        const icon = btn.querySelector('i');
        const text = btn.querySelector('span');
        
        // Change state
        icon.className = 'fa-solid fa-check';
        text.innerText = 'Copied!';
        btn.style.borderColor = '#38bdf8';
        btn.style.color = '#38bdf8';
        
        // Reset after 2 seconds
        setTimeout(() => {
            icon.className = 'fa-regular fa-copy';
            text.innerText = 'Copy';
            btn.style.borderColor = '';
            btn.style.color = '';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
});