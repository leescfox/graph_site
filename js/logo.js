function pageLoaded() {
    const logo = document.getElementById('siteTitle')
    const firstLetter = logo.querySelector('.blueText')
    const secondLetter = logo.querySelector('.purpleText')
    logo.addEventListener('mouseenter', changeLetterColors)
    logo.addEventListener('mouseleave', changeLetterColors)

    function changeLetterColors() {
        firstLetter.classList.toggle('blueText')
        firstLetter.classList.toggle('purpleText')
        secondLetter.classList.toggle('blueText')
        secondLetter.classList.toggle('purpleText')
    }
}

document.addEventListener('DOMContentLoaded', pageLoaded)