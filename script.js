function goToPage(pageUrl) {
    window.location.href = pageUrl;
}

function transitionPage(currentPageId, nextPageUrl) {
    const currentPageElement = document.getElementById(currentPageId);

    currentPageElement.classList.add('fade-out');

    setTimeout(() => {
        window.location.href = nextPageUrl;
    }, 1000);
}

