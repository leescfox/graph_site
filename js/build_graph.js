function page_loaded() {
    const html = document.querySelector('html')
    const header = document.querySelector('.header')
    const lines_container = document.querySelector('.lines_container')
    const nodes_container = document.querySelector('.nodes_container')
    let max_zIndex = 4
    const graph = {
        nodes: [],
        connections: []
    }
    let storedGraph = JSON.parse(localStorage.getItem('graph'))
    header_initialize()
    build_nodes(storedGraph.nodes)
    place_nodes(graph.nodes)
    handle_connections(storedGraph.connections)

    function header_initialize() {
        const create_node = document.getElementById('header_create_node')
        const save = document.getElementById('save_in_local')
        const download = document.getElementById('download_graph')
        const new_field = document.getElementById('new_field')
        create_node.addEventListener('click', create_node_modal)
        save.addEventListener('click', save_graph)
        download.addEventListener('click', download_graph_modal)
        new_field.addEventListener('click', new_field_modal)
    }

    function save_graph() {
        const result = {
            nodes: [],
            connections: graph.connections
        }
        graph.nodes.forEach(elem => {
            result.nodes.push({ name: elem.node.dataset.name, data: elem.node.dataset.data })
        })
        localStorage.setItem('graph', JSON.stringify(result))
    }

    function build_node(name, data) {
        const graph_element = {
            connected_with: []
        }
        const newNode = document.createElement('div')
        change_name(newNode, name)
        newNode.dataset.data = data
        newNode.classList.add('node')
        newNode.ondragstart = () => false
        newNode.addEventListener('mousedown', dnd_start)
        newNode.addEventListener('dblclick', reveal_actions_modal)
        graph_element.node = newNode
        graph.nodes.push(graph_element)
        nodes_container.append(newNode)
        return graph_element
    }

    function build_nodes(nodes) {
        nodes.forEach(elem => {
            build_node(elem.name, elem.data)
        })
    }

    function place_nodes(nodes) {
        const half_screen = document.querySelector('.field_wrapper').getBoundingClientRect().height / 2
        const left_side = document.querySelector('.left_side').getBoundingClientRect()
        const right_side = document.querySelector('.right_side').getBoundingClientRect()
        let count = 0
        const multiplier = 50
        nodes.forEach((element, index) => {
            const node_size = element.node.getBoundingClientRect()
            element.node.style.top = half_screen + (count - 1) * (node_size.height + multiplier) + 'px'
            if (index % 2 === 0) {
                element.node.style.left = left_side.width - node_size.width - multiplier + 'px'
            } else {
                element.node.style.left = right_side.left + multiplier + 'px'
                count = count + 1
            }
        })
    }

    function handle_connections(connections) {
        connections.forEach(connection => {
            connect_nodes(find_node(connection[0]), find_node(connection[1]))
        })
    }

    function find_node(name) {
        return graph.nodes.findIndex(element => element.node.dataset.name === name)
    }

    function connect_nodes(index_1, index_2) {
        if (index_1 === index_2) return false
        for (let i = 0; i < graph.connections.length; i = i + 1) {
            if (!graph.connections[i].includes(graph.nodes[index_1].node.dataset.name)) continue
            if (!graph.connections[i].includes(graph.nodes[index_2].node.dataset.name)) continue
            return false
        }
        const coords_1 = graph.nodes[index_1].node.getBoundingClientRect()
        const coords_2 = graph.nodes[index_2].node.getBoundingClientRect()
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
        line.classList.add('line')
        line.addEventListener('dblclick', line_delete_modal)
        line.setAttribute('x1', coords_1.left + coords_1.width / 2)
        line.setAttribute('y1', coords_1.top + coords_1.height / 2)
        line.setAttribute('x2', coords_2.left + coords_2.width / 2)
        line.setAttribute('y2', coords_2.top + coords_2.height / 2)
        graph.nodes[index_1].connected_with.push([line, '1'])
        graph.nodes[index_2].connected_with.push([line, '2'])
        graph.connections.push([graph.nodes[index_1].node.dataset.name, graph.nodes[index_2].node.dataset.name])
        lines_container.append(line)
        return true
    }

    function increase_zIndex(element) {
        max_zIndex = max_zIndex + 1
        element.style.zIndex = max_zIndex
    }

    function dnd_start(event) {
        const target = graph.nodes[find_node(this.dataset.name)]
        const target_coords = target.node.getBoundingClientRect()
        const half_width = target_coords.width / 2
        const half_height = target_coords.height / 2
        const shiftX = event.clientX - target_coords.left
        const shiftY = event.clientY - target_coords.top
        increase_zIndex(target.node)
        increase_zIndex(header)
        html.style.cursor = 'pointer'
        header.classList.toggle('hover_active')
        document.addEventListener('mousemove', move_at)
        document.addEventListener('mouseup', dnd_end)

        function move_at(e) {
            const page_size = lines_container.getBoundingClientRect()
            const header_bottom = header.getBoundingClientRect().height
            const touch_header = e.clientY - shiftY <= header_bottom
            const newPositionX = e.pageX - shiftX <= 0 ? 0 : e.pageX - shiftX
            const newPositionY = touch_header ? e.pageY - e.clientY + header_bottom : e.pageY - shiftY
            if (newPositionX + 50 >= page_size.width) {
                lines_container.style.width = page_size.width + 1000 + 'px'
            }
            if (newPositionY + 50 >= page_size.height) {
                lines_container.style.height = page_size.height + 500 + 'px'
            }
            const node_centerX = newPositionX + half_width
            const node_centerY = newPositionY + half_height
            target.node.style.left = newPositionX + 'px'
            target.node.style.top = newPositionY + 'px'
            target.connected_with.forEach(line => {
                line[0].setAttribute(`x${line[1]}`, node_centerX)
                line[0].setAttribute(`y${line[1]}`, node_centerY)
            })
        }

        function dnd_end() {
            html.style.cursor = 'default'
            header.classList.toggle('hover_active')
            document.removeEventListener('mousemove', move_at)
            document.removeEventListener('mouseup', dnd_end)
        }
    }

    function change_name(node, name) {
        node.dataset.name = name
        if (name.length > 5) {
            node.textContent = name.substring(0, 6) + '..'
        } else {
            node.textContent = name
        }
    }

    function node_name_error(span, msg) {
        span.textContent = msg
        span.style.color = 'rgb(255, 0, 0)'
        setTimeout(() => {
            span.textContent = 'Редактировать название:'
            span.style.color = 'rgb(255, 255, 255)'
        }, 1000)
    }

    function delete_line(line) {
        let connection = []
        let count = 0
        for (let i = 0; count < 2; i = i + 1) {
            for (let j = 0; j < graph.nodes[i].connected_with.length && count < 2; j = j + 1) {
                if (graph.nodes[i].connected_with[j][0] === line) {
                    connection.push(graph.nodes[i].node.dataset.name)
                    graph.nodes[i].connected_with.splice(j, 1)
                    count = count + 1
                    break
                }
            }
        }
        graph.connections.splice(graph.connections.findIndex(elem => {
            if (!elem.includes(connection[0])) return false
            if (!elem.includes(connection[1])) return false
            return true
        }), 1)
        line.remove()
    }

    function correct_connections(old_name, new_name) {
        graph.connections.forEach(connection => {
            const index = connection.findIndex(elem => elem === old_name)
            if (index === -1) return
            connection[index] = new_name
        })
    }

    function create_node_modal() {
        const modal = document.getElementById('create_node_modal')
        const error_span = modal.querySelector('.error_msg')
        const name_input = document.getElementById('enter_name')
        const data_input = document.getElementById('enter_data')
        const create_btn = document.getElementById('create_node_btn')
        let md_target
        increase_zIndex(modal)
        modal.style.display = 'flex'
        modal.addEventListener('click', try_to_close)
        modal.addEventListener('mousedown', md_target_save)
        create_btn.addEventListener('click', create_node)

        function md_target_save(event) {
            md_target = event.target
        }

        function create_node() {
            if (name_input.value.trim().length === 0) {
                node_name_error(error_span, 'Вы не ввели название!')
                return
            }
            if (find_node(name_input.value) !== -1) {
                node_name_error(error_span, 'Такой узел уже существует!')
                return
            }
            const newNode = build_node(name_input.value, data_input.value)
            newNode.node.style.top = '48%'
            newNode.node.style.left = '47%'
            close_modal()
        }

        function try_to_close(event) {
            if (event.target === modal || event.target.classList.contains('close_modal')) {
                close_modal()
            }
        }

        function close_modal() {
            modal.removeEventListener('click', try_to_close)
            modal.removeEventListener('mousedown', md_target_save)
            create_btn.removeEventListener('click', create_node)
            modal.style.display = 'none'
        }
    }

    function download_graph_modal() {
        const modal = document.getElementById('download_graph_modal')
        const name_input = document.getElementById('file_name')
        const txt_btn = document.getElementById('txt')
        const json_btn = document.getElementById('json')
        const xml_btn = document.getElementById('xml')
        const error_span = modal.querySelector('.error_msg')
        let md_target
        modal.addEventListener('click', try_to_close)
        modal.addEventListener('mousedown', md_target_save)
        txt_btn.addEventListener('click', download_graph)
        json_btn.addEventListener('click', download_graph)
        xml_btn.addEventListener('click', download_graph)
        increase_zIndex(modal)
        modal.style.display = 'flex'

        function md_target_save(event) {
            md_target = event.target
        }

        function download_graph() {
            if (name_input.value.trim().length === 0) {
                node_name_error(error_span, 'Вы не ввели имя!')
                return
            }
            save_graph()
            const a = document.createElement('a')
            const file = new Blob([this.getAttribute('id') === 'xml' ? xml_file() : localStorage.getItem('graph')])
            a.setAttribute('href', URL.createObjectURL(file))
            a.setAttribute('download', `${name_input.value}.${this.getAttribute('id')}`)
            a.click()
            name_input.value = ''
            close_modal()
        }

        function xml_file() {
            const xml_graph = document.createElement('graph')
            const xml_nodes = document.createElement('nodes')
            const xml_connections = document.createElement('connections')
            const graph_obj = JSON.parse(localStorage.getItem('graph'))
            graph_obj.nodes.forEach(node => {
                const xml_node = document.createElement('node')
                const xml_name = document.createElement('name')
                const xml_data = document.createElement('data')
                xml_name.textContent = node.name
                xml_data.textContent = node.data
                xml_node.append(xml_name, xml_data)
                xml_nodes.append(xml_node)
            })
            graph_obj.connections.forEach(connection => {
                const xml_connection = document.createElement('connection')
                const point_1 = document.createElement('point')
                const point_2 = document.createElement('point')
                point_1.textContent = connection[0]
                point_2.textContent = connection[1]
                xml_connection.append(point_1, point_2)
                xml_connections.append(xml_connection)
            })
            xml_graph.append(xml_nodes, xml_connections)
            return xml_graph.outerHTML
        }

        function try_to_close(event) {
            if (event.target === modal || event.target.classList.contains('close_modal')) {
                close_modal()
            }
        }

        function close_modal() {
            modal.removeEventListener('click', try_to_close)
            modal.removeEventListener('mousedown', md_target_save)
            txt_btn.removeEventListener('click', download_graph)
            json_btn.removeEventListener('click', download_graph)
            xml_btn.removeEventListener('click', download_graph)
            modal.style.display = 'none'
        }
    }

    function new_field_modal() {
        const modal = document.getElementById('new_field_modal')
        const create_field_btn = document.getElementById('new_field_confirm')
        let md_target
        increase_zIndex(modal)
        modal.style.display = 'flex'
        modal.addEventListener('click', try_to_close)
        modal.addEventListener('mousedown', md_target_save)
        create_field_btn.addEventListener('click', new_field)

        function new_field() {
            graph.nodes = []
            graph.connections = []
            save_graph()
            nodes_container.innerHTML = ''
            lines_container.innerHTML = ''
        }

        function md_target_save(event) {
            md_target = event.target
        }

        function try_to_close(event) {
            if ((event.target === modal && md_target === modal) || event.target.classList.contains('close_modal')) {
                close_modal()
            }
        }

        function close_modal() {
            modal.removeEventListener('click', try_to_close)
            modal.removeEventListener('mousedown', md_target_save)
            create_field_btn.removeEventListener('click', new_field)
            modal.style.display = 'none'
        }
    }

    function reveal_actions_modal() {
        const modal = document.getElementById('node_actions_modal')
        const name_input = document.getElementById('change_name')
        const data_input = document.getElementById('change_data')
        const finish_btn = document.getElementById('node_actions_done')
        const delete_node_btn = modal.querySelector('.delete_node')
        const new_connection = modal.querySelector('.new_connection')
        const error_span = modal.querySelector('.error_msg')
        let md_target
        const delete_node = () => {
            const index = find_node(this.dataset.name)
            const target = graph.nodes[index]
            while (target.connected_with.length > 0) {
                delete_line(target.connected_with[0][0])
            }
            graph.nodes.splice(index, 1)
            target.node.remove()
            close_modal()
        }
        const finish = () => {
            if (name_input.value.trim().length === 0) {
                node_name_error(error_span, 'Вы не ввели название!')
                return
            }
            if (find_node(name_input.value) !== -1 && this.dataset.name !== name_input.value) {
                node_name_error(error_span, 'Такой узел уже существует!')
                return
            }
            correct_connections(this.dataset.name, name_input.value)
            change_name(this, name_input.value)
            this.dataset.data = data_input.value
            close_modal()
        }
        const create_connection = () => {
            const second_node = event => {
                if (!event.target.classList.contains('node')) return
                connect_nodes(find_node(this.dataset.name), find_node(event.target.dataset.name))
                nodes_container.classList.toggle('create_connection')
                this.classList.toggle('chosen_node')
                change_name(this, this.dataset.name)
                nodes_container.removeEventListener('click', second_node)
                close_modal()
            }
            nodes_container.classList.toggle('create_connection')
            this.classList.toggle('chosen_node')
            this.textContent = 'Отмена'
            nodes_container.addEventListener('click', second_node)
            modal.style.display = 'none'
        }
        name_input.value = this.dataset.name
        data_input.value = this.dataset.data
        increase_zIndex(modal)
        modal.style.display = 'flex'
        modal.addEventListener('click', try_to_close)
        modal.addEventListener('mousedown', md_target_save)
        delete_node_btn.addEventListener('click', delete_node)
        new_connection.addEventListener('click', create_connection)
        finish_btn.addEventListener('click', finish)

        function md_target_save(event) {
            md_target = event.target
        }

        function try_to_close(event) {
            if ((event.target === modal && md_target === modal) || event.target.classList.contains('close_modal')) {
                close_modal()
            }
        }

        function close_modal() {
            modal.removeEventListener('click', try_to_close)
            modal.removeEventListener('mousedown', md_target_save)
            delete_node_btn.removeEventListener('click', delete_node)
            new_connection.removeEventListener('click', create_connection)
            finish_btn.removeEventListener('click', finish)
            modal.style.display = 'none'
        }
    }

    function line_delete_modal() {
        const modal = document.getElementById('line_delete_modal')
        const delete_btn = document.getElementById('delete_line')
        let md_target
        const delete_confirmed = () => {
            delete_line(this)
        }
        increase_zIndex(modal)
        modal.style.display = 'flex'
        modal.addEventListener('click', try_to_close)
        modal.addEventListener('mousedown', md_target_save)
        delete_btn.addEventListener('click', delete_confirmed)

        function md_target_save(event) {
            md_target = event.target
        }

        function try_to_close(event) {
            if ((event.target === modal && md_target === modal) || event.target.classList.contains('close_modal')) {
                close_modal()
            }
        }

        function close_modal() {
            modal.removeEventListener('click', try_to_close)
            modal.removeEventListener('mousedown', md_target_save)
            delete_btn.removeEventListener('click', delete_confirmed)
            modal.style.display = 'none'
        }
    }
}

document.addEventListener('DOMContentLoaded', page_loaded)