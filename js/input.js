function page_loaded() {
    const input_status = document.getElementById('input_status')
    const input = document.getElementById('file_input')
    const input_label = document.getElementById('input_label')
    const build_btn = document.querySelector('.build_btn')

    input.addEventListener('change', file_loaded)

    async function file_loaded() {
        let data
        let filename = input.files[0].name
        status_change(filename)
        filename = filename.toLowerCase()
        try {
            data = await input.files[0].text()
            if (filename.endsWith('.xml')) {
                data = xml_to_obj(data)
            }
            JSON.parse(data) //чтобы работал catch
            localStorage.setItem('graph', data)
            build_available(true)
        }
        catch {
            status_change('Граф не найден...')
            build_available(false)
        }
    }

    function status_change(text) {
        input_status.textContent = text
        for (let i = 15; input_status.offsetWidth >= input_label.offsetWidth; i = i - 1) {
            input_status.textContent = text.substring(0, i) + '...'
        }
    }

    function build_available(upload_success) {
        if (upload_success === true) {
            build_btn.classList.remove('build_unavailable')
            build_btn.addEventListener('click', transition)
        } else {
            build_btn.classList.add('build_unavailable')
            build_btn.removeEventListener('click', transition)
        }
    }

    function transition() {
        input.value = null
        window.location.href = 'html/graph.html'
    }

    function xml_to_obj(string) {
        const parser = new DOMParser()
        const xmlDOM = parser.parseFromString(string, 'text/xml')
        let result = {
            nodes: [],
            connections: []
        }
        xmlDOM.querySelectorAll('node').forEach(node => {
            const node_object = {
                name: node.querySelector('name').textContent,
                data: node.querySelector('data').textContent
            }
            result.nodes.push(node_object)
        })
        xmlDOM.querySelectorAll('connection').forEach(connection => {
            let connection_array = []
            connection.querySelectorAll('point').forEach(point => {
                connection_array.push(point.textContent)
            })
            result.connections.push(connection_array)
        })
        return JSON.stringify(result)
    }
}

document.addEventListener('DOMContentLoaded', page_loaded)