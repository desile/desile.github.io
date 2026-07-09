class NetworkGame {
    constructor() {
        this.levels = this.defineLevels();
        this.currentLevel = 0;
        this.score = 0;
        this.delivered = 0;
        this.lost = 0;
        this.selectedNode = null;
        this.packets = [];
        this.isAutoMode = false;
        this.autoInterval = null;
        this.levelComplete = false;
        this.packetsToDeliver = 0;
        this.packetsDeliveredThisLevel = 0;
        
        this.initElements();
        this.initEventListeners();
        this.loadLevel(0);
    }
    
    defineLevels() {
        return [
            {
                name: "Основы маршрутизации",
                description: "Направьте HTTP-запросы от клиента к веб-серверу через роутер.",
                goal: "Доставьте 5 HTTP-пакетов на Web Server",
                lesson: "🎓 <strong>Урок:</strong> Роутер анализирует IP-адрес назначения пакета и перенаправляет его по правилам маршрутизации. Без правильных правил пакеты теряются!",
                requiredDeliveries: 5,
                nodes: [
                    { id: 'client1', type: 'client', label: 'Client', ip: '192.168.1.10', x: 50, y: 200 },
                    { id: 'router1', type: 'router', label: 'Router', ip: '192.168.1.1', x: 300, y: 200 },
                    { id: 'server1', type: 'server', label: 'Web Server', ip: '10.0.0.5', x: 550, y: 200, ports: [80] }
                ],
                connections: [
                    ['client1', 'router1'],
                    ['router1', 'server1']
                ],
                packets: [
                    { from: 'client1', to: '10.0.0.5', port: 80, type: 'http' }
                ],
                initialRules: {}
            },
            {
                name: "Несколько серверов",
                description: "Теперь у нас два сервера. Настройте роутер, чтобы HTTP шёл на Web-сервер, а запросы к БД — на Database.",
                goal: "Доставьте пакеты на правильные серверы (всего 8)",
                lesson: "🎓 <strong>Урок:</strong> Маршрутизация по портам позволяет направлять разные типы трафика на разные серверы. Порт 80 = HTTP, порт 3306 = MySQL.",
                requiredDeliveries: 8,
                nodes: [
                    { id: 'client1', type: 'client', label: 'Client', ip: '192.168.1.10', x: 50, y: 150 },
                    { id: 'client2', type: 'client', label: 'App', ip: '192.168.1.11', x: 50, y: 300 },
                    { id: 'router1', type: 'router', label: 'Router', ip: '192.168.1.1', x: 300, y: 225 },
                    { id: 'server1', type: 'server', label: 'Web Server', ip: '10.0.0.5', x: 550, y: 120, ports: [80, 443] },
                    { id: 'database1', type: 'database', label: 'Database', ip: '10.0.0.10', x: 550, y: 330, ports: [3306] }
                ],
                connections: [
                    ['client1', 'router1'],
                    ['client2', 'router1'],
                    ['router1', 'server1'],
                    ['router1', 'database1']
                ],
                packets: [
                    { from: 'client1', to: '10.0.0.5', port: 80, type: 'http' },
                    { from: 'client2', to: '10.0.0.10', port: 3306, type: 'db' },
                    { from: 'client1', to: '10.0.0.5', port: 80, type: 'http' },
                    { from: 'client2', to: '10.0.0.10', port: 3306, type: 'db' }
                ],
                initialRules: {}
            },
            {
                name: "HTTPS и безопасность",
                description: "Настройте маршрутизацию для защищённых HTTPS соединений (порт 443).",
                goal: "Доставьте 6 HTTPS-пакетов на Secure Server",
                lesson: "🎓 <strong>Урок:</strong> HTTPS использует порт 443 и шифрует данные с помощью TLS/SSL. Всегда используйте HTTPS для передачи конфиденциальных данных!",
                requiredDeliveries: 6,
                nodes: [
                    { id: 'client1', type: 'client', label: 'Browser', ip: '192.168.1.10', x: 50, y: 200 },
                    { id: 'router1', type: 'router', label: 'Gateway', ip: '192.168.1.1', x: 250, y: 200 },
                    { id: 'firewall1', type: 'firewall', label: 'Firewall', ip: '10.0.0.1', x: 450, y: 200 },
                    { id: 'server1', type: 'server', label: 'Secure Server', ip: '10.0.0.100', x: 650, y: 200, ports: [443] }
                ],
                connections: [
                    ['client1', 'router1'],
                    ['router1', 'firewall1'],
                    ['firewall1', 'server1']
                ],
                packets: [
                    { from: 'client1', to: '10.0.0.100', port: 443, type: 'https' }
                ],
                initialRules: {}
            },
            {
                name: "Сложная топология",
                description: "Настройте маршрутизацию через два роутера для доступа к внутренней сети.",
                goal: "Доставьте 10 пакетов разных типов",
                lesson: "🎓 <strong>Урок:</strong> В реальных сетях пакеты проходят через множество роутеров. Каждый роутер знает только своих соседей и принимает решение локально.",
                requiredDeliveries: 10,
                nodes: [
                    { id: 'client1', type: 'client', label: 'Office PC', ip: '192.168.1.10', x: 50, y: 120 },
                    { id: 'client2', type: 'client', label: 'Laptop', ip: '192.168.1.11', x: 50, y: 280 },
                    { id: 'router1', type: 'router', label: 'Edge Router', ip: '192.168.1.1', x: 220, y: 200 },
                    { id: 'router2', type: 'router', label: 'Core Router', ip: '10.0.0.1', x: 420, y: 200 },
                    { id: 'server1', type: 'server', label: 'Web Server', ip: '10.10.1.5', x: 620, y: 100, ports: [80, 443] },
                    { id: 'server2', type: 'server', label: 'SSH Server', ip: '10.10.1.10', x: 620, y: 200, ports: [22] },
                    { id: 'database1', type: 'database', label: 'Database', ip: '10.10.2.5', x: 620, y: 320, ports: [5432] }
                ],
                connections: [
                    ['client1', 'router1'],
                    ['client2', 'router1'],
                    ['router1', 'router2'],
                    ['router2', 'server1'],
                    ['router2', 'server2'],
                    ['router2', 'database1']
                ],
                packets: [
                    { from: 'client1', to: '10.10.1.5', port: 80, type: 'http' },
                    { from: 'client2', to: '10.10.1.10', port: 22, type: 'ssh' },
                    { from: 'client1', to: '10.10.2.5', port: 5432, type: 'db' },
                    { from: 'client2', to: '10.10.1.5', port: 443, type: 'https' }
                ],
                initialRules: {}
            },
            {
                name: "Мастер сетей",
                description: "Финальный уровень! Настройте полную корпоративную сеть с DMZ.",
                goal: "Доставьте 15 пакетов без потерь",
                lesson: "🎓 <strong>Поздравляем!</strong> Вы освоили основы маршрутизации! В реальных сетях используются протоколы динамической маршрутизации (OSPF, BGP), но принципы остаются теми же.",
                requiredDeliveries: 15,
                nodes: [
                    { id: 'internet', type: 'client', label: 'Internet', ip: '0.0.0.0', x: 50, y: 200 },
                    { id: 'fw1', type: 'firewall', label: 'Firewall', ip: '203.0.113.1', x: 180, y: 200 },
                    { id: 'dmz_router', type: 'router', label: 'DMZ Router', ip: '192.168.0.1', x: 350, y: 120 },
                    { id: 'int_router', type: 'router', label: 'Internal Router', ip: '10.0.0.1', x: 350, y: 280 },
                    { id: 'web', type: 'server', label: 'Public Web', ip: '192.168.0.10', x: 520, y: 50, ports: [80, 443] },
                    { id: 'mail', type: 'server', label: 'Mail Server', ip: '192.168.0.20', x: 520, y: 150, ports: [25, 443] },
                    { id: 'app', type: 'server', label: 'App Server', ip: '10.0.1.10', x: 520, y: 250, ports: [8080] },
                    { id: 'db', type: 'database', label: 'Database', ip: '10.0.2.10', x: 520, y: 350, ports: [3306, 5432] }
                ],
                connections: [
                    ['internet', 'fw1'],
                    ['fw1', 'dmz_router'],
                    ['fw1', 'int_router'],
                    ['dmz_router', 'web'],
                    ['dmz_router', 'mail'],
                    ['int_router', 'app'],
                    ['int_router', 'db']
                ],
                packets: [
                    { from: 'internet', to: '192.168.0.10', port: 80, type: 'http' },
                    { from: 'internet', to: '192.168.0.10', port: 443, type: 'https' },
                    { from: 'internet', to: '192.168.0.20', port: 443, type: 'https' },
                    { from: 'internet', to: '10.0.1.10', port: 8080, type: 'http' },
                    { from: 'internet', to: '10.0.2.10', port: 3306, type: 'db' }
                ],
                initialRules: {}
            }
        ];
    }
    
    initElements() {
        this.networkCanvas = document.getElementById('network-canvas');
        this.connectionsSvg = document.getElementById('connections-svg');
        this.nodesContainer = document.getElementById('nodes-container');
        this.packetsContainer = document.getElementById('packets-container');
        this.routingRules = document.getElementById('routing-rules');
        this.taskContent = document.getElementById('task-content');
        this.infoContent = document.getElementById('info-content');
        
        this.levelEl = document.getElementById('level');
        this.levelNameEl = document.getElementById('level-name');
        this.scoreEl = document.getElementById('score');
        this.deliveredEl = document.getElementById('delivered');
        this.lostEl = document.getElementById('lost');
        
        this.sendPacketBtn = document.getElementById('send-packet-btn');
        this.autoSendBtn = document.getElementById('auto-send-btn');
        this.resetLevelBtn = document.getElementById('reset-level-btn');
        this.nextLevelBtn = document.getElementById('next-level-btn');
        this.addRuleBtn = document.getElementById('add-rule-btn');
        
        this.ruleModal = document.getElementById('rule-modal');
        this.completeModal = document.getElementById('complete-modal');
        this.packetTooltip = document.getElementById('packet-tooltip');
    }
    
    initEventListeners() {
        this.sendPacketBtn.addEventListener('click', () => this.sendPacket());
        this.autoSendBtn.addEventListener('click', () => this.toggleAutoMode());
        this.resetLevelBtn.addEventListener('click', () => this.loadLevel(this.currentLevel));
        this.nextLevelBtn.addEventListener('click', () => this.loadLevel(this.currentLevel + 1));
        this.addRuleBtn.addEventListener('click', () => this.openRuleModal());
        
        document.getElementById('modal-close').addEventListener('click', () => this.closeRuleModal());
        document.getElementById('save-rule-btn').addEventListener('click', () => this.saveRule());
        document.getElementById('delete-rule-btn').addEventListener('click', () => this.deleteRule());
        document.getElementById('next-level-modal-btn').addEventListener('click', () => {
            this.completeModal.classList.remove('show');
            this.loadLevel(this.currentLevel + 1);
        });
        
        this.ruleModal.addEventListener('click', (e) => {
            if (e.target === this.ruleModal) this.closeRuleModal();
        });
    }
    
    loadLevel(levelIndex) {
        if (levelIndex >= this.levels.length) {
            alert('🎉 Поздравляем! Вы прошли все уровни!');
            return;
        }
        
        this.stopAutoMode();
        this.currentLevel = levelIndex;
        this.level = this.levels[levelIndex];
        this.levelComplete = false;
        this.packetsDeliveredThisLevel = 0;
        this.packetsToDeliver = this.level.requiredDeliveries;
        this.nodes = {};
        this.routingTables = {};
        this.editingRule = null;
        this.selectedNode = null;
        
        this.packets.forEach(p => p.element?.remove());
        this.packets = [];
        
        this.level.nodes.forEach(node => {
            this.nodes[node.id] = { ...node };
            if (node.type === 'router' || node.type === 'firewall') {
                this.routingTables[node.id] = [];
            }
        });
        
        this.connections = this.level.connections.map(([a, b]) => ({ from: a, to: b }));
        
        this.updateUI();
        this.renderNetwork();
        this.renderTask();
        this.renderRoutingRules();
        
        this.nextLevelBtn.disabled = true;
    }
    
    updateUI() {
        this.levelEl.textContent = this.currentLevel + 1;
        this.levelNameEl.textContent = this.level.name;
        this.scoreEl.textContent = this.score;
        this.deliveredEl.textContent = this.delivered;
        this.lostEl.textContent = this.lost;
    }
    
    renderNetwork() {
        this.nodesContainer.innerHTML = '';
        this.connectionsSvg.innerHTML = '';
        
        this.connections.forEach(conn => {
            const fromNode = this.nodes[conn.from];
            const toNode = this.nodes[conn.to];
            
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', fromNode.x + 30);
            line.setAttribute('y1', fromNode.y + 30);
            line.setAttribute('x2', toNode.x + 30);
            line.setAttribute('y2', toNode.y + 30);
            line.dataset.from = conn.from;
            line.dataset.to = conn.to;
            this.connectionsSvg.appendChild(line);
        });
        
        Object.values(this.nodes).forEach(node => {
            const nodeEl = document.createElement('div');
            nodeEl.className = `node node-${node.type}`;
            nodeEl.dataset.id = node.id;
            nodeEl.style.left = node.x + 'px';
            nodeEl.style.top = node.y + 'px';
            
            const icons = {
                client: '💻',
                router: '🔀',
                server: '🖥️',
                firewall: '🛡️',
                database: '🗄️'
            };
            
            nodeEl.innerHTML = `
                <div class="node-icon">${icons[node.type]}</div>
                <div class="node-label">
                    ${node.label}
                    <div class="node-ip">${node.ip}</div>
                </div>
            `;
            
            nodeEl.addEventListener('click', () => this.selectNode(node.id));
            this.nodesContainer.appendChild(nodeEl);
        });
    }
    
    renderTask() {
        this.taskContent.innerHTML = `
            <p>${this.level.description}</p>
            <div class="goal">
                <strong>🎯 Цель:</strong> ${this.level.goal}<br>
                <small>Прогресс: ${this.packetsDeliveredThisLevel}/${this.packetsToDeliver}</small>
            </div>
        `;
    }
    
    selectNode(nodeId) {
        const node = this.nodes[nodeId];
        
        document.querySelectorAll('.node').forEach(n => n.classList.remove('selected'));
        document.querySelector(`.node[data-id="${nodeId}"]`)?.classList.add('selected');
        
        this.selectedNode = nodeId;
        
        if (node.type === 'router' || node.type === 'firewall') {
            this.addRuleBtn.disabled = false;
            this.renderRoutingRules();
        } else {
            this.addRuleBtn.disabled = true;
            this.routingRules.innerHTML = `
                <div class="rule-hint">
                    <strong>${node.label}</strong><br>
                    IP: ${node.ip}<br>
                    ${node.ports ? 'Порты: ' + node.ports.join(', ') : ''}
                </div>
            `;
        }
    }
    
    renderRoutingRules() {
        if (!this.selectedNode) {
            this.routingRules.innerHTML = '<div class="rule-hint">Выберите роутер для настройки</div>';
            return;
        }
        
        const rules = this.routingTables[this.selectedNode] || [];
        
        if (rules.length === 0) {
            this.routingRules.innerHTML = '<div class="rule-hint">Нет правил. Добавьте правило маршрутизации.</div>';
            return;
        }
        
        this.routingRules.innerHTML = rules.map((rule, index) => `
            <div class="rule-item" data-index="${index}">
                <div class="rule-condition">
                    Если → ${rule.destination === '*' ? 'любой' : rule.destination}:${rule.port === '*' ? '*' : rule.port}
                </div>
                <div class="rule-action">
                    Направить на → ${this.nodes[rule.nextHop]?.label || rule.nextHop}
                </div>
            </div>
        `).join('');
        
        this.routingRules.querySelectorAll('.rule-item').forEach(item => {
            item.addEventListener('click', () => {
                const index = parseInt(item.dataset.index);
                this.openRuleModal(index);
            });
        });
    }
    
    openRuleModal(editIndex = null) {
        if (!this.selectedNode) return;
        
        this.editingRule = editIndex;
        const rule = editIndex !== null ? this.routingTables[this.selectedNode][editIndex] : null;
        
        const destSelect = document.getElementById('rule-destination');
        destSelect.innerHTML = '<option value="*">Любой адрес (*)</option>';
        Object.values(this.nodes).forEach(node => {
            if (node.id !== this.selectedNode) {
                destSelect.innerHTML += `<option value="${node.ip}">${node.ip} (${node.label})</option>`;
            }
        });
        
        const nextHopSelect = document.getElementById('rule-next-hop');
        nextHopSelect.innerHTML = '<option value="">Выберите...</option>';
        
        this.getNeighbors(this.selectedNode).forEach(neighborId => {
            const neighbor = this.nodes[neighborId];
            nextHopSelect.innerHTML += `<option value="${neighborId}">${neighbor.label} (${neighbor.ip})</option>`;
        });
        
        if (rule) {
            destSelect.value = rule.destination;
            document.getElementById('rule-port').value = rule.port;
            nextHopSelect.value = rule.nextHop;
        } else {
            destSelect.value = '*';
            document.getElementById('rule-port').value = '*';
            nextHopSelect.value = '';
        }
        
        document.getElementById('delete-rule-btn').style.display = editIndex !== null ? 'block' : 'none';
        this.ruleModal.classList.add('show');
    }
    
    closeRuleModal() {
        this.ruleModal.classList.remove('show');
        this.editingRule = null;
    }
    
    saveRule() {
        const destination = document.getElementById('rule-destination').value;
        const port = document.getElementById('rule-port').value;
        const nextHop = document.getElementById('rule-next-hop').value;
        
        if (!nextHop) {
            alert('Выберите, куда направить пакет');
            return;
        }
        
        const rule = { destination, port, nextHop };
        
        if (this.editingRule !== null) {
            this.routingTables[this.selectedNode][this.editingRule] = rule;
        } else {
            this.routingTables[this.selectedNode].push(rule);
        }
        
        this.closeRuleModal();
        this.renderRoutingRules();
    }
    
    deleteRule() {
        if (this.editingRule !== null) {
            this.routingTables[this.selectedNode].splice(this.editingRule, 1);
            this.closeRuleModal();
            this.renderRoutingRules();
        }
    }
    
    getNeighbors(nodeId) {
        const neighbors = [];
        this.connections.forEach(conn => {
            if (conn.from === nodeId) neighbors.push(conn.to);
            if (conn.to === nodeId) neighbors.push(conn.from);
        });
        return neighbors;
    }
    
    sendPacket() {
        if (this.levelComplete) return;
        
        const packetTemplates = this.level.packets;
        const template = packetTemplates[Math.floor(Math.random() * packetTemplates.length)];
        
        const packet = {
            id: Date.now() + Math.random(),
            from: template.from,
            to: template.to,
            port: template.port,
            type: template.type,
            currentNode: template.from,
            path: [template.from],
            element: null
        };
        
        this.createPacketElement(packet);
        this.packets.push(packet);
        this.animatePacket(packet);
    }
    
    createPacketElement(packet) {
        const el = document.createElement('div');
        el.className = `packet packet-${packet.type}`;
        
        const icons = { http: '📄', https: '🔒', ssh: '🔑', db: '💾' };
        el.textContent = icons[packet.type] || '📦';
        
        const startNode = this.nodes[packet.from];
        el.style.left = (startNode.x + 30) + 'px';
        el.style.top = (startNode.y + 30) + 'px';
        
        el.addEventListener('mouseenter', (e) => this.showPacketTooltip(e, packet));
        el.addEventListener('mouseleave', () => this.hidePacketTooltip());
        
        this.packetsContainer.appendChild(el);
        packet.element = el;
    }
    
    showPacketTooltip(e, packet) {
        const tooltip = this.packetTooltip;
        const portNames = { 80: 'HTTP', 443: 'HTTPS', 22: 'SSH', 3306: 'MySQL', 5432: 'PostgreSQL', 8080: 'HTTP-Alt', 25: 'SMTP' };
        
        tooltip.querySelector('.tooltip-content').innerHTML = `
            <p><strong>Тип:</strong> ${packet.type.toUpperCase()}</p>
            <p><strong>Откуда:</strong> ${this.nodes[packet.from]?.ip}</p>
            <p><strong>Куда:</strong> ${packet.to}</p>
            <p><strong>Порт:</strong> ${packet.port} (${portNames[packet.port] || 'Unknown'})</p>
        `;
        
        tooltip.style.left = (e.clientX + 15) + 'px';
        tooltip.style.top = (e.clientY + 15) + 'px';
        tooltip.classList.add('show');
    }
    
    hidePacketTooltip() {
        this.packetTooltip.classList.remove('show');
    }
    
    async animatePacket(packet) {
        const currentNode = this.nodes[packet.currentNode];
        const nextNodeId = this.findNextHop(packet);
        
        if (!nextNodeId) {
            this.packetLost(packet, 'Нет маршрута');
            return;
        }
        
        if (packet.path.includes(nextNodeId)) {
            this.packetLost(packet, 'Петля маршрутизации');
            return;
        }
        
        const nextNode = this.nodes[nextNodeId];
        packet.path.push(nextNodeId);
        
        this.highlightConnection(packet.currentNode, nextNodeId);
        
        await this.movePacketTo(packet, nextNode);
        
        packet.currentNode = nextNodeId;
        
        if (this.isDestination(packet, nextNode)) {
            this.packetDelivered(packet);
        } else if (nextNode.type === 'router' || nextNode.type === 'firewall') {
            await this.delay(200);
            this.animatePacket(packet);
        } else {
            this.packetLost(packet, 'Пакет не дошёл до цели');
        }
    }
    
    findNextHop(packet) {
        const currentNode = this.nodes[packet.currentNode];
        
        if (currentNode.type === 'client') {
            return this.getNeighbors(packet.currentNode)[0];
        }
        
        if (currentNode.type === 'router' || currentNode.type === 'firewall') {
            const rules = this.routingTables[packet.currentNode] || [];
            
            for (const rule of rules) {
                const destMatch = rule.destination === '*' || rule.destination === packet.to;
                const portMatch = rule.port === '*' || rule.port === String(packet.port);
                
                if (destMatch && portMatch) {
                    return rule.nextHop;
                }
            }
            
            return null;
        }
        
        return null;
    }
    
    isDestination(packet, node) {
        return node.ip === packet.to && node.ports?.includes(packet.port);
    }
    
    movePacketTo(packet, targetNode) {
        return new Promise(resolve => {
            const el = packet.element;
            const targetX = targetNode.x + 30;
            const targetY = targetNode.y + 30;
            
            const startX = parseFloat(el.style.left);
            const startY = parseFloat(el.style.top);
            const duration = 500;
            const startTime = Date.now();
            
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                
                el.style.left = (startX + (targetX - startX) * eased) + 'px';
                el.style.top = (startY + (targetY - startY) * eased) + 'px';
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };
            
            animate();
        });
    }
    
    highlightConnection(from, to) {
        const line = this.connectionsSvg.querySelector(`line[data-from="${from}"][data-to="${to}"], line[data-from="${to}"][data-to="${from}"]`);
        if (line) {
            line.classList.add('active');
            setTimeout(() => line.classList.remove('active'), 600);
        }
    }
    
    packetDelivered(packet) {
        packet.element.classList.add('delivered');
        setTimeout(() => {
            packet.element.remove();
            this.packets = this.packets.filter(p => p.id !== packet.id);
        }, 500);
        
        this.delivered++;
        this.packetsDeliveredThisLevel++;
        this.score += 10;
        this.updateUI();
        this.renderTask();
        
        if (this.packetsDeliveredThisLevel >= this.packetsToDeliver) {
            this.completeLevel();
        }
    }
    
    packetLost(packet, reason) {
        packet.element.classList.add('lost');
        setTimeout(() => {
            packet.element.remove();
            this.packets = this.packets.filter(p => p.id !== packet.id);
        }, 500);
        
        this.lost++;
        this.updateUI();
    }
    
    completeLevel() {
        this.levelComplete = true;
        this.stopAutoMode();
        this.nextLevelBtn.disabled = false;
        
        const bonus = Math.max(0, 50 - this.lost * 10);
        this.score += bonus;
        this.updateUI();
        
        document.getElementById('complete-delivered').textContent = this.packetsDeliveredThisLevel;
        document.getElementById('complete-lost').textContent = this.lost;
        document.getElementById('complete-bonus').textContent = bonus;
        document.getElementById('complete-score').textContent = this.score;
        document.getElementById('complete-lesson').innerHTML = this.level.lesson;
        
        setTimeout(() => {
            this.completeModal.classList.add('show');
        }, 500);
    }
    
    toggleAutoMode() {
        if (this.isAutoMode) {
            this.stopAutoMode();
        } else {
            this.startAutoMode();
        }
    }
    
    startAutoMode() {
        if (this.levelComplete) return;
        this.isAutoMode = true;
        this.autoSendBtn.textContent = '⏸️ Стоп';
        this.autoSendBtn.classList.add('active');
        this.sendPacketBtn.disabled = true;
        
        this.autoInterval = setInterval(() => {
            if (!this.levelComplete) {
                this.sendPacket();
            } else {
                this.stopAutoMode();
            }
        }, 1500);
    }
    
    stopAutoMode() {
        this.isAutoMode = false;
        this.autoSendBtn.textContent = '⚡ Авто-режим';
        this.autoSendBtn.classList.remove('active');
        this.sendPacketBtn.disabled = false;
        
        if (this.autoInterval) {
            clearInterval(this.autoInterval);
            this.autoInterval = null;
        }
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new NetworkGame();
});
