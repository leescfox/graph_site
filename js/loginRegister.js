function pageLoaded() {
    const options = Array.from(document.getElementsByClassName('option'))
    const switchOptionBtn = Array.from(document.getElementsByClassName('otherOption_click'))

    switchOptionBtn.forEach(elem => elem.addEventListener('click', switchOption))
    options.forEach(elem => elem.addEventListener('submit', checkPassLen))

    function switchOption() {
        options.forEach(option => {
            option.classList.toggle('alternativeOption')
            option.classList.toggle('currentOption')
        })
    }

    function checkPassLen(e) {
        const password = document.querySelector('.currentOption .password')
        if (password.value.length < 6) {
            e.preventDefault()
            error(document.querySelector('.currentOption .labelForPass'), 'Пароль должен быть больше 6 символов!')
        }
        const secondPass = document.querySelector('.currentOption .secondPass')
        if (secondPass === null) return
        if (secondPass.value !== password.value) {
            e.preventDefault()
            error(document.querySelector('.currentOption .labelForSecondPass'), 'Пароли должны совпадать!')
        }
    }

    function error(span, msg) {
        let text = span.textContent
        let btn = document.querySelector('.currentOption .confirmBtn')
        span.textContent = msg
        span.classList.toggle('red')
        btn.disabled = true
        btn.classList.toggle('blue')
        setTimeout(() => {
            span.textContent = text
            span.classList.toggle('red')
            btn.disabled = false
            btn.classList.toggle('blue')
        }, 1000)
    }


}

document.addEventListener('DOMContentLoaded', pageLoaded)