
            // ── Dashboard ────────────────────────────────────────────────────────

            async function loadDashboard() {
                try {
                    const res = await fetch('/api/admin-financial?resource=dashboard', {
                        headers: { 'x-admin-password': _password },
                    });
                    if (!res.ok) throw new Error('Erro ao carregar dashboard.');
                    const { dashboard } = await res.json();
                    renderDashboard(dashboard);
                } catch (err) {
                    console.error('Dashboard:', err.message);
                }
            }

            function renderDashboard(d) {
                const fin = d.financial;
                const sch = d.school;
                const sto = d.store;

                document.getElementById('dash-kpi-grid').innerHTML = `
                    <div class="dash-kpi-card">
                        <div class="dash-kpi-icon" style="background:rgba(34,197,94,.12);color:#86efac"><i class="fas fa-dollar-sign" aria-hidden="true"></i></div>
                        <div class="dash-kpi-label">Receita do Mês</div>
                        <div class="dash-kpi-value good">${money.format(fin.revenue)}</div>
                    </div>
                    <div class="dash-kpi-card">
                        <div class="dash-kpi-icon" style="background:rgba(251,191,36,.12);color:#fcd34d"><i class="fas fa-minus-circle" aria-hidden="true"></i></div>
                        <div class="dash-kpi-label">Despesas do Mês</div>
                        <div class="dash-kpi-value warn">${money.format(fin.outgoings)}</div>
                    </div>
                    <div class="dash-kpi-card">
                        <div class="dash-kpi-icon" style="background:rgba(96,165,250,.12);color:#93c5fd"><i class="fas fa-scale-balanced" aria-hidden="true"></i></div>
                        <div class="dash-kpi-label">Saldo do Mês</div>
                        <div class="dash-kpi-value ${fin.balance >= 0 ? 'good' : 'bad'}">${money.format(fin.balance)}</div>
                    </div>
                    <div class="dash-kpi-card">
                        <div class="dash-kpi-icon" style="background:rgba(248,113,113,.12);color:#fca5a5"><i class="fas fa-clock" aria-hidden="true"></i></div>
                        <div class="dash-kpi-label">Mensalidades Pendentes</div>
                        <div class="dash-kpi-value warn">${money.format(fin.pending_tuitions)}</div>
                    </div>
                    <div class="dash-kpi-card">
                        <div class="dash-kpi-icon" style="background:rgba(167,139,250,.12);color:#c4b5fd"><i class="fas fa-graduation-cap" aria-hidden="true"></i></div>
                        <div class="dash-kpi-label">Alunos Ativos</div>
                        <div class="dash-kpi-value">${sch.active_students}</div>
                    </div>
                    <div class="dash-kpi-card">
                        <div class="dash-kpi-icon" style="background:rgba(52,211,153,.12);color:#6ee7b7"><i class="fas fa-chalkboard-user" aria-hidden="true"></i></div>
                        <div class="dash-kpi-label">Professores</div>
                        <div class="dash-kpi-value">${sch.active_teachers}</div>
                    </div>
                    <div class="dash-kpi-card">
                        <div class="dash-kpi-icon" style="background:rgba(251,191,36,.12);color:#fcd34d"><i class="fas fa-clock" aria-hidden="true"></i></div>
                        <div class="dash-kpi-label">Pedidos Pendentes</div>
                        <div class="dash-kpi-value ${sto.pending_orders > 0 ? 'warn' : ''}">${sto.pending_orders}</div>
                    </div>
                    <div class="dash-kpi-card">
                        <div class="dash-kpi-icon" style="background:rgba(248,113,113,.12);color:#fca5a5"><i class="fas fa-exclamation-triangle" aria-hidden="true"></i></div>
                        <div class="dash-kpi-label">Alunos em Atraso</div>
                        <div class="dash-kpi-value ${fin.overdue_students > 0 ? 'bad' : 'good'}">${fin.overdue_students}</div>
                    </div>
                `;

                const classes = sch.today_classes || [];
                var scheduled = classes.filter(function(c){ return c.status === 'scheduled' || !c.status; });
                var completed = classes.filter(function(c){ return c.status === 'completed'; });
                document.getElementById('dash-classes-count').textContent = classes.length;
                if (!classes.length) {
                    document.getElementById('dash-today-classes').innerHTML = '<div class="dash-empty">Nenhuma aula hoje. 🎉</div>';
                } else {
                    var html = '';
                    if (scheduled.length) {
                        html += '<div style="font-size:10px;color:#71717a;text-transform:uppercase;letter-spacing:.05em;padding:8px 0 4px;font-weight:700">📌 Próximas (' + scheduled.length + ')</div>';
                        html += scheduled.map(function(c) {
                            var typ = c.lesson_type && c.lesson_type !== 'regular' ? '<span style="font-size:9px;color:#fcd34d;margin-left:4px">(' + c.lesson_type.replace('_',' ') + ')</span>' : '';
                            var dur = c.duration_minutes ? '<span style="font-size:10px;color:#52525b;margin-left:4px">' + c.duration_minutes + 'min</span>' : '';
                            return '<div class="dash-class-row">' +
                                '<span class="dash-class-time">' + (c.start_time || c.class_time || '--:--') + '</span>' +
                                '<span class="dash-class-student">' + (c.students?.name || 'Aluno') + typ + '</span>' +
                                '<span class="dash-class-teacher">' + (c.teachers?.name || '—') + (c.instrument ? ' · ' + c.instrument : '') + dur + '</span>' +
                            '</div>';
                        }).join('');
                    }
                    if (completed.length) {
                        html += '<div style="font-size:10px;color:#71717a;text-transform:uppercase;letter-spacing:.05em;padding:8px 0 4px;font-weight:700;border-top:1px solid #1f1f22;margin-top:4px">✅ Realizadas (' + completed.length + ')</div>';
                        html += completed.map(function(c) {
                            return '<div class="dash-class-row" style="opacity:0.6">' +
                                '<span class="dash-class-time">' + (c.start_time || c.class_time || '--:--') + '</span>' +
                                '<span class="dash-class-student">' + (c.students?.name || 'Aluno') + '</span>' +
                                '<span class="dash-class-teacher">' + (c.teachers?.name || '—') + (c.instrument ? ' · ' + c.instrument : '') + '</span>' +
                            '</div>';
                        }).join('');
                    }
                    document.getElementById('dash-today-classes').innerHTML = html;
                }

                const alerts = [];
                if (fin.overdue_students > 0) alerts.push({ icon: '🔴', text: fin.overdue_students + ' aluno(s) com mensalidade em atraso' });
                if (sto.pending_orders > 0) alerts.push({ icon: '🟡', text: sto.pending_orders + ' pedido(s) pendente(s) na loja' });
                if (sto.low_stock_products?.length > 0) alerts.push({ icon: '🟠', text: sto.low_stock_products.length + ' produto(s) com estoque baixo' });

                document.getElementById('dash-alerts').innerHTML = alerts.length
                    ? alerts.map(a => `
                        <div class="dash-alert-row">
                            <span class="dash-alert-icon">${a.icon}</span>
                            <span class="dash-alert-text">${a.text}</span>
                        </div>
                    `).join('')
                    : '<div class="dash-empty">Nenhum alerta no momento. ✅</div>';

                const orders = sto.recent_orders || [];
                document.getElementById('dash-recent-orders').innerHTML = orders.length
                    ? orders.map(o => `
                        <div class="dash-order-row">
                            <span class="dash-order-id">${o.id}</span>
                            <span class="dash-order-customer">${o.customer_name || '—'}</span>
                            <span class="dash-order-total">${money.format(o.total)}</span>
                            <span class="status-pill status-${o.status}" style="font-size:10px;padding:1px 6px">${statusLabel(o.status)}</span>
                        </div>
                    `).join('')
                    : '<div class="dash-empty">Nenhum pedido recente.</div>';

                const lowStock = sto.low_stock_products || [];
                document.getElementById('dash-low-stock').innerHTML = lowStock.length
                    ? lowStock.map(p => `
                        <div class="dash-stock-row">
                            <span class="dash-stock-name">${p.name}</span>
                            <span class="dash-stock-count">${p.stock} un.</span>
                        </div>
                    `).join('')
                    : '<div class="dash-empty">Nenhum produto com estoque baixo. ✅</div>';
            }

const money      = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
            const STORAGE_KEY = 'bruna_admin_session';
            const NEW_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutos
            const REFRESH_INTERVAL = 60;             // segundos

            const STATUS_LABELS = { approved:'Aprovado', pending:'Pendente', rejected:'Rejeitado', cancelled:'Cancelado', refunded:'Devolvido' };

            const loginScreen  = document.getElementById('login-screen');
            const panelScreen  = document.getElementById('panel-screen');
            const ordersArea   = document.getElementById('orders-area');
            const loginError   = document.getElementById('login-error');
            const kpiGrid      = document.getElementById('kpi-grid');
            const searchInput  = document.getElementById('search-input');
            const statusFilter = document.getElementById('status-filter');
            const refreshCounter = document.getElementById('refresh-counter');

            let _allOrders  = [];
            let _allProducts = [];
            let _password   = null;
            let _activeTab  = 'orders';
            let _productFilters = { search: '', category: '', status: '' };
            let _countdown  = REFRESH_INTERVAL;
            let _timer      = null;
            let _expandedRows = new Set(); // IDs de pedidos com detalhe aberto
            let _allEnrollments = [];
            let _allLessons = [];
            // ---- AULAS (lessons) ----

            async function loadLessons() {
                var area = document.getElementById('lessons-area');
                if (!area) { return; }
                area.innerHTML = '<div class="empty-state">Carregando aulas...</div>';
                try {
                    var date_from = document.getElementById('lesson-date-from').value;
                    var date_to = document.getElementById('lesson-date-to').value;
                    var status = document.getElementById('lesson-status-filter').value;
                    var url = '/api/admin-financial?resource=lessons&limit=200';
                    if (date_from) url += '&date_from=' + date_from;
                    if (date_to) url += '&date_to=' + date_to;
                    if (status) url += '&status=' + status;
                    var res = await fetch(url, { headers: { 'x-admin-password': _password } });
                    if (!res.ok) throw new Error('Erro ao carregar aulas.');
                    var data = await res.json();
                    _allLessons = data.lessons || [];
                    renderLessons();
                } catch (err) {
                    area.innerHTML = '<div class="empty-state" style="color:#fca5a5">Erro: ' + err.message + '</div>';
                }
            }

            function renderLessons() {
                var area = document.getElementById('lessons-area');
                if (!area) return;
                var lessons = _allLessons || [];
                if (!lessons.length) {
                    area.innerHTML = '<div class="empty-state">Nenhuma aula encontrada no per\u00edodo.</div>';
                    return;
                }
                var byDate = {};
                lessons.forEach(function(l) { var d = l.date; if (!byDate[d]) byDate[d] = []; byDate[d].push(l); });
                var sortedDates = Object.keys(byDate).sort();
                var labels = { scheduled:'Agendada', completed:'Realizada', cancelled:'Cancelada', make_up:'Reposi\u00e7\u00e3o' };
                area.innerHTML = sortedDates.map(function(date) {
                    var items = byDate[date].sort(function(a,b) { return (a.start_time||'').localeCompare(b.start_time||''); });
                    var dayName = new Date(date+'T12:00:00').toLocaleDateString('pt-BR',{weekday:'long'});
                    var fmtDate = new Date(date+'T12:00:00').toLocaleDateString('pt-BR');
                    var today = new Date(); var todayStr = today.getFullYear()+'-'+String(today.getMonth()+1).padStart(2,'0')+'-'+String(today.getDate()).padStart(2,'0');
                    var isToday = date === todayStr;
                    var cards = items.map(function(l) {
                        var typeLabel = '';
                        if (l.lesson_type === 'make_up') typeLabel = '<span class="lesson-type-badge">Reposi\u00e7\u00e3o</span>';
                        else if (l.lesson_type === 'trial') typeLabel = '<span class="lesson-type-badge">Experimental</span>';
                        else if (l.lesson_type === 'extra') typeLabel = '<span class="lesson-type-badge">Extra</span>';
                        var completedClass = l.status === 'completed' ? 'completed' : '';
                        var statusBar = '<div class="status-bar ' + (l.status || 'scheduled') + '"></div>';
                        var attIcon = l.status === 'completed'
                            ? '<span style="font-size:11px;color:#86efac;font-weight:700">\u2714\ufe0f</span>'
                            : '<button class="btn-action-small btn-attendance-lesson" data-lesson-id="'+l.id+'" title="Presen\u00e7a">\ud83d\udc64</button>';
                        return '<div class="lesson-card ' + completedClass + '" data-lesson-id="'+l.id+'">' +
                            statusBar +
                            '<div class="lesson-time">' + (l.start_time||'--:--') + '</div>' +
                            '<div class="lesson-info">' +
                                '<div class="student-name">' + (l.students?.name||'\u2014') + typeLabel + '</div>' +
                                '<div class="teacher-name">' + (l.teachers?.name||'\u2014') + (l.instrument ? ' \u00b7 ' + l.instrument : '') + '</div>' +
                            '</div>' +
                            '<div class="lesson-actions">' +
                                attIcon + ' ' +
                                '<button class="btn-action-small btn-edit-lesson" data-lesson-id="'+l.id+'" title="Editar">\u270f\ufe0f</button> ' +
                                '<button class="btn-action-small btn-action-danger btn-delete-lesson" data-lesson-id="'+l.id+'" title="Excluir">\ud83d\uddd1\ufe0f</button>' +
                            '</div></div>';
                    }).join('');
                    return '<div class="lesson-day-group">' +
                        '<div class="lesson-day-header">' +
                            '<span class="day-name">' + dayName.charAt(0).toUpperCase() + dayName.slice(1) + (isToday ? ' <span style="color:#dc2626;font-size:10px;font-weight:400">(Hoje)</span>' : '') + '</span>' +
                            '<span class="day-count">' + fmtDate + ' \u00b7 ' + items.length + ' aula' + (items.length > 1 ? 's' : '') + '</span>' +
                        '</div>' + cards + '</div>';
                }).join('');
                area.querySelectorAll('.btn-attendance-lesson').forEach(function(b) {
                    b.addEventListener('click', function(){ openAttendanceModal(b.dataset.lessonId); });
                });
                area.querySelectorAll('.btn-edit-lesson').forEach(function(b) {
                    b.addEventListener('click', function(){
                        var l = _allLessons.find(function(x){ return x.id === b.dataset.lessonId; });
                        if (l) openLessonModal(l);
                    });
                });
                area.querySelectorAll('.btn-delete-lesson').forEach(function(b) {
                    b.addEventListener('click', async function() {
                        if (!confirm('Excluir esta aula?')) return;
                        try {
                            var r = await fetch('/api/admin-financial?resource=lessons&id='+b.dataset.lessonId, {
                                method: 'DELETE',
                                headers: { 'x-admin-password': _password },
                            });
                            if (!r.ok) throw new Error('Erro ao excluir.');
                            showToast('Aula exclu\u00edda');
                            loadLessons();
                        } catch(e) { showToast('Erro: '+e.message); }
                    });
                });
            }
async function openLessonModal(lesson) {
    var modal = document.getElementById('modal-new-lesson');
    var form = document.getElementById('form-new-lesson');
    var title = document.getElementById('lesson-modal-title');
    if (!modal || !form) return;
    // Clear form
    form.reset();
    document.getElementById('form-lesson-status').textContent = '';
    // Populate enrollment select
    loadEnrollments().then(function(){
        if (lesson) {
            // Edit mode
            title.textContent = 'Editar Aula';
            form.querySelector('[name="id"]').value = lesson.id;
            form.querySelector('[name="enrollment_id"]').value = lesson.enrollment_id || '';
            form.querySelector('[name="date"]').value = lesson.date || '';
            form.querySelector('[name="start_time"]').value = lesson.start_time || '';
            form.querySelector('[name="duration_minutes"]').value = lesson.duration_minutes || 60;
            form.querySelector('[name="lesson_type"]').value = lesson.lesson_type || 'regular';
            form.querySelector('[name="notes"]').value = lesson.notes || '';
            var preview = document.getElementById('lesson-enrollment-preview');
            if (preview && lesson.students) {
                preview.innerHTML = '<small style="color:#a1a1aa">Vinculo: ' + (lesson.students.name || '') + ' - ' + (lesson.teachers?.name || '') + ' (' + (lesson.instruments?.name || '') + ')</small>';
                preview.style.display = 'block';
            }
        } else {
            // New mode
            title.textContent = 'Nova Aula';
            form.querySelector('[name="id"]').value = '';
            var today = new Date();
            var dd = String(today.getDate()).padStart(2, '0');
            var mm = String(today.getMonth() + 1).padStart(2, '0');
            var yyyy = today.getFullYear();
            form.querySelector('[name="date"]').value = yyyy + '-' + mm + '-' + dd;
            form.querySelector('[name="duration_minutes"]').value = 60;
            form.querySelector('[name="lesson_type"]').value = 'regular';
            var preview = document.getElementById('lesson-enrollment-preview');
            if (preview) { preview.style.display = 'none'; }
        }
        modal.style.display = 'flex';
    });
}

function closeLessonModal() {
                var modal = document.getElementById('modal-new-lesson');
                if (modal) modal.style.display='none';
            }

            async function openAttendanceModal(lessonId) {
                var modal = document.getElementById('modal-attendance');
                var form = document.getElementById('form-attendance');
                if (!modal || !form) { showToast('Erro: modal nao encontrado'); return; }
                form.reset();
                var lesson = _allLessons.find(function(l){return l.id===lessonId;});
                if (!lesson) { showToast('Aula n\u00e3o encontrada'); return; }
                var info = document.getElementById('attendance-lesson-info');
                if (!info) return;
                var dateObj = new Date(lesson.date+'T12:00:00');
                var fmtDate = dateObj.toLocaleDateString('pt-BR');
                info.innerHTML = '<strong>'+(lesson.students?.name||'Aluno')+'</strong> \u2014 '+(lesson.instrument||'\u2014')+'<br><span style="color:#71717a">'+fmtDate+' \u00e0s '+(lesson.start_time||'--:--')+' \u00b7 Prof: '+(lesson.teachers?.name||'\u2014')+'</span>';
                form.querySelector('[name="lesson_id"]').value=lessonId;
                form.querySelector('[name="student_id"]').value=lesson.student_id;
                try {
                    var r = await fetch('/api/admin-financial?resource=attendance&lesson_id='+lessonId,{headers:{'x-admin-password':_password}});
                    if (r.ok) {
                        var data = await r.json(); var att = data.attendance ? data.attendance[0] : null;
                        if (att) {
                            form.querySelector('[name="status"]').value=att.status;
                            form.querySelector('[name="late_minutes"]').value=att.late_minutes||0;
                            form.querySelector('[name="notes"]').value=att.notes||'';
                            var titleEl = document.getElementById('attendance-modal-title');
                            if (titleEl) titleEl.textContent='Editar Presen\u00e7a';
                        }
                    }
                } catch(_) {}
                var statusSel = form.querySelector('[name="status"]');
                if (statusSel) {
                    statusSel.onchange=function(){
                        var lateField = document.getElementById('attendance-late-field');
                        if (lateField) lateField.style.display=this.value==='late'?'block':'none';
                    };
                    statusSel.dispatchEvent(new Event('change'));
                }
                modal.style.display='flex';
            }

            function closeAttendanceModal() {
                var modal = document.getElementById('modal-attendance');
                if (modal) modal.style.display='none';
            }

            // ── AGENDA MENSAL (Calendário) ──────────────────────────────

            var _agendaMonthOffset = 0;

            function getMonthRange(offset) {
                var now = new Date();
                var year = now.getFullYear();
                var month = now.getMonth() + offset;
                // Adjust for overflow
                var firstDay = new Date(year, month, 1);
                var lastDay = new Date(year, month + 1, 0);
                // Start from the Sunday of the week containing the 1st
                var start = new Date(firstDay);
                start.setDate(firstDay.getDate() - firstDay.getDay());
                // End at the Saturday of the week containing the last day
                var end = new Date(lastDay);
                end.setDate(lastDay.getDate() + (6 - lastDay.getDay()));
                return { month: month, year: firstDay.getFullYear(), firstDay: firstDay, lastDay: lastDay, start: start, end: end };
            }

            function formatDate(d) {
                return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
            }

            async function loadMonthAgenda() {
                var cal = document.getElementById('agenda-calendar');
                if (!cal) return;
                cal.innerHTML = '<div class="empty-state">Carregando agenda...</div>';
                var range = getMonthRange(_agendaMonthOffset);
                var dateFrom = formatDate(range.start);
                var dateTo = formatDate(range.end);
                try {
                    var url = '/api/admin-financial?resource=lessons&date_from=' + dateFrom + '&date_to=' + dateTo + '&limit=500';
                    var res = await fetch(url, { headers: { 'x-admin-password': _password } });
                    if (!res.ok) throw new Error('Erro ao carregar agenda.');
                    var data = await res.json();
                    var lessons = data.lessons || [];
                    renderMonthAgenda(lessons, range);
                } catch (err) {
                    cal.innerHTML = '<div class="empty-state" style="color:#fca5a5">Erro: ' + err.message + '</div>';
                }
            }

            function renderMonthAgenda(lessons, range) {
                var cal = document.getElementById('agenda-calendar');
                if (!cal) return;
                var byDate = {};
                lessons.forEach(function(l) {
                    var d = l.date;
                    if (!byDate[d]) byDate[d] = [];
                    byDate[d].push(l);
                });
                var today = new Date();
                var todayStr = formatDate(today);
                var monthNames = ['Janeiro','Fevereiro','Mar\u00e7o','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
                var dayHeaderNames = ['Dom','Seg','Ter','Qua','Qui','Sex','S\u00e1b'];

                // Month label
                var monthLabel = document.getElementById('agenda-month-label');
                if (monthLabel) {
                    monthLabel.textContent = monthNames[range.month] + ' ' + range.year;
                }

                // Generate all days from start to end
                var days = [];
                var d = new Date(range.start);
                while (d <= range.end) {
                    var dateStr = formatDate(d);
                    var isCurrentMonth = d.getMonth() === range.month;
                    days.push({
                        date: new Date(d),
                        dateStr: dateStr,
                        isToday: dateStr === todayStr,
                        isCurrentMonth: isCurrentMonth,
                        dayOfWeek: d.getDay(),
                        items: byDate[dateStr] || []
                    });
                    d.setDate(d.getDate() + 1);
                }

                // Build calendar HTML
                var html = '';
                // Day name headers
                for (var i = 0; i < 7; i++) {
                    var isWeekend = (i === 0 || i === 6);
                    html += '<div class="agenda-cal-header' + (isWeekend ? ' weekend' : '') + '">' + dayHeaderNames[i] + '</div>';
                }
                // Day cells
                days.forEach(function(day) {
                    var cls = 'agenda-day-cell';
                    if (day.isToday) cls += ' today';
                    if (!day.isCurrentMonth) cls += ' other-month';
                    if (day.items.length > 0) cls += ' has-lessons';
                    var dayNumCls = 'agenda-day-number' + (day.isToday ? ' today' : '');

                    // Build lesson markers (max 3 visible, then "+ N mais")
                    var markers = '';
                    var maxVisible = 3;
                    var sorted = day.items.sort(function(a,b) { return (a.start_time||'').localeCompare(b.start_time||''); });
                    var visibleItems = sorted.slice(0, maxVisible);
                    var remaining = sorted.length - maxVisible;
                    visibleItems.forEach(function(l) {
                        var s = l.status || 'scheduled';
                        var time = l.start_time || '--:--';
                        var name = l.students?.name || '\u2014';
                        markers += '<div class="agenda-lesson-marker ' + s + '" data-lesson-id="' + l.id + '">' +
                            '<span class="time">' + time + '</span> <span class="name">' + name + '</span>' +
                        '</div>';
                    });
                    if (remaining > 0) {
                        markers += '<div class="agenda-more-link" data-date="' + day.dateStr + '">+' + remaining + ' mais</div>';
                    }

                    var dayNum = day.date.getDate();
                    html += '<div class="' + cls + '" data-date="' + day.dateStr + '">' +
                        '<div class="' + dayNumCls + '">' + dayNum + '</div>' +
                        markers +
                    '</div>';
                });

                cal.innerHTML = html;

                // Click handlers for day cells and more links
                cal.querySelectorAll('.agenda-day-cell').forEach(function(cell) {
                    cell.addEventListener('click', function() {
                        openAgendaDayModal(this.dataset.date);
                    });
                });
                cal.querySelectorAll('.agenda-more-link').forEach(function(link) {
                    link.addEventListener('click', function(e) {
                        e.stopPropagation();
                        openAgendaDayModal(this.dataset.date);
                    });
                });
                // Click handlers for lesson markers (open attendance)
                cal.querySelectorAll('.agenda-lesson-marker').forEach(function(marker) {
                    marker.addEventListener('click', function(e) {
                        e.stopPropagation();
                        openAttendanceModal(this.dataset.lessonId);
                    });
                });

                // Summary counts (only for current month)
                var total = 0, scheduled = 0, completed = 0;
                days.forEach(function(day) {
                    if (day.isCurrentMonth) {
                        total += day.items.length;
                        day.items.forEach(function(l) {
                            if (l.status === 'completed') completed++;
                            else scheduled++;
                        });
                    }
                });
                document.getElementById('agenda-total-count').textContent = total;
                document.getElementById('agenda-scheduled-count').textContent = scheduled;
                document.getElementById('agenda-completed-count').textContent = completed;
            }

            function openAgendaDayModal(dateStr) {
                var modal = document.getElementById('agenda-day-modal');
                var title = document.getElementById('agenda-day-modal-title');
                var body = document.getElementById('agenda-day-modal-body');
                if (!modal || !body) return;
                // Format date
                var parts = dateStr.split('-');
                var d = new Date(parts[0], parts[1]-1, parts[2]);
                var dayName = d.toLocaleDateString('pt-BR', { weekday:'long', day:'numeric', month:'long' });
                title.textContent = dayName;
                // Find lessons for this day from the calendar
                var cells = document.querySelectorAll('#agenda-calendar .agenda-day-cell[data-date="' + dateStr + '"]');
                var markers = cells.length ? cells[0].querySelectorAll('.agenda-lesson-marker') : [];
                if (!markers.length) {
                    body.innerHTML = '<div class="dash-empty">Nenhuma aula neste dia.</div>';
                } else {
                    var html = '';
                    markers.forEach(function(m) {
                        var lessonId = m.dataset.lessonId;
                        var time = m.querySelector('.time')?.textContent || '--:--';
                        var name = m.querySelector('.name')?.textContent || '\u2014';
                        var cls = m.classList.contains('completed') ? 'completed' : '';
                        // Find full lesson data
                        var lesson = null;
                        if (_allLessons && lessonId) {
                            lesson = _allLessons.find(function(x) { return String(x.id) === String(lessonId); });
                        }
                        var teacher = lesson?.teachers?.name || '';
                        var status = lesson?.status || 'scheduled';
                        var statusLabels = { scheduled:'Agendada', completed:'Realizada', cancelled:'Cancelada', make_up:'Reposi\u00e7\u00e3o' };
                        var statusIcon = status === 'completed' ? '\u2705' : status === 'cancelled' ? '\u274c' : '\ud83d\udcc5';
                        html += '<div class="lesson-item">' +
                            '<span class="lesson-time">' + time + '</span>' +
                            '<span class="lesson-student">' + name + (teacher ? '<br><span class="lesson-teacher">' + teacher + '</span>' : '') + '</span>' +
                            '<span class="lesson-status">' + statusIcon + ' ' + (statusLabels[status] || status) + '</span>' +
                            '<button class="btn-action-small btn-attendance-lesson" data-lesson-id="' + lessonId + '" title="Presen\u00e7a">\ud83d\udc64</button>' +
                        '</div>';
                    });
                    body.innerHTML = html;
                    // Attach attendance listeners
                    body.querySelectorAll('.btn-attendance-lesson').forEach(function(b) {
                        b.addEventListener('click', function() {
                            openAttendanceModal(this.dataset.lessonId);
                        });
                    });
                }
                modal.style.display = 'flex';
            }

            function closeAgendaDayModal() {
                var modal = document.getElementById('agenda-day-modal');
                if (modal) modal.style.display = 'none';
            }


            let _allTeacherPayments = [];
            const DAY_MAP = { seg: 'Segunda', ter: 'Terça', qua: 'Quarta', qui: 'Quinta', sex: 'Sexta', sab: 'Sábado', dom: 'Domingo' };
            const DAY_ORDER = ['seg','ter','qua','qui','sex','sab','dom'];

            const statusLabel = s => STATUS_LABELS[s] || s;
            const isNew = o => (Date.now() - new Date(o.created_at).getTime()) < NEW_THRESHOLD_MS;

            // js-cache-storage: cache da senha em memória — evita sessionStorage.getItem() repetido
            const _passwordCache = { value: null };
            function getPassword() {
                if (_passwordCache.value) return _passwordCache.value;
                _passwordCache.value = sessionStorage.getItem(STORAGE_KEY);
                return _passwordCache.value;
            }

            function showToast(msg) {
                const el = document.createElement('div');
                el.className = 'toast';
                el.textContent = msg;
                document.body.appendChild(el);
                setTimeout(() => el.remove(), 3000);
            }

            // ── Navegação entre abas ────────────────────────────────────────────────

function switchTab(tab) {
    _activeTab = tab;
    document.getElementById('tab-dashboard').style.display = tab === 'dashboard' ? '' : 'none';
    document.getElementById('tab-agenda').style.display    = tab === 'agenda'    ? '' : 'none';
    document.getElementById('tab-orders').style.display    = tab === 'orders'    ? '' : 'none';
    document.getElementById('tab-products').style.display  = tab === 'products'  ? '' : 'none';
    document.getElementById('tab-financial').style.display = tab === 'financial' ? '' : 'none';
    document.getElementById('export-csv-btn').style.display = tab === 'orders' ? '' : 'none';
    document.querySelectorAll('.nav-tabs > .nav-tab').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    if (tab === 'dashboard') loadDashboard();
    if (tab === 'agenda') loadMonthAgenda();
    if (tab === 'products' && !_allProducts.length) loadProducts();
    if (tab === 'financial') {
        initFinancialPeriodFilter();
        loadFinancialData();
    }
}

            // Apenas tabs principais (não sub-tabs)
            document.querySelectorAll('.nav-tabs > .nav-tab').forEach(btn => {
                btn.addEventListener('click', () => switchTab(btn.dataset.tab));
            });

            // ── APIs ──────────────────────────────────────────────────────────────

            async function fetchOrders(password) {
                const res = await fetch('/api/admin-orders', { headers: { 'x-admin-password': password } });
                if (res.status === 401) throw new Error('Senha incorreta.');
                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(text || 'Erro ao buscar pedidos.');
                }
                return res.json();
            }

            async function updateOrderStatus(orderId, status) {
                // Corrigido: a API api/update-order-status.js exige método POST
                // (não PATCH) e o campo "status" no corpo (não "newStatus").
                const res = await fetch('/api/update-order-status', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'x-admin-password': _password },
                    body: JSON.stringify({ orderId, status }),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Erro ao atualizar status.');
                return data.order;
            }

            async function verifyMpPayment(mpPaymentId, container) {
                container.innerHTML = '<span style="color:#52525b">Consultando MP…</span>';
                try {
                    const res = await fetch(`/api/verify-mp-payment?mpPaymentId=${mpPaymentId}`, {
                        headers: { 'x-admin-password': _password },
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error || 'Erro');
                    const approved = data.dateApproved ? new Date(data.dateApproved).toLocaleString('pt-BR') : '—';
                    container.className = 'mp-result ok';
                    container.innerHTML = `
                        <strong>Status MP:</strong> ${data.status} (${data.statusDetail})<br>
                        <strong>Valor:</strong> ${money.format(data.amount)}<br>
                        <strong>Método:</strong> ${data.method}<br>
                        <strong>Aprovado em:</strong> ${approved}
                    `;
                } catch (e) {
                    container.className = 'mp-result err';
                    container.textContent = '❌ ' + e.message;
                }
            }

            // ── KPIs ──────────────────────────────────────────────────────────────

            function isSameDay(dateStr, ref) {
                const d = new Date(dateStr);
                return d.getFullYear()===ref.getFullYear() && d.getMonth()===ref.getMonth() && d.getDate()===ref.getDate();
            }
            function isSameMonth(dateStr, ref) {
                const d = new Date(dateStr);
                return d.getFullYear()===ref.getFullYear() && d.getMonth()===ref.getMonth();
            }

            function renderKpis(orders) {
                const now      = new Date();
                const approved = orders.filter(o => o.status === 'approved');
                const today    = approved.filter(o => isSameDay(o.created_at, now)).reduce((s,o)=>s+Number(o.total),0);
                const month    = approved.filter(o => isSameMonth(o.created_at, now)).reduce((s,o)=>s+Number(o.total),0);
                const pending  = orders.filter(o => o.status === 'pending').length;
                kpiGrid.innerHTML = `
                    <div class="kpi-card"><div class="kpi-label">Receita Hoje</div><div class="kpi-value good">${money.format(today)}</div></div>
                    <div class="kpi-card"><div class="kpi-label">Receita do Mês</div><div class="kpi-value good">${money.format(month)}</div></div>
                    <div class="kpi-card"><div class="kpi-label">Pedidos Pendentes</div><div class="kpi-value ${pending>0?'warn':''}">${pending}</div></div>
                    <div class="kpi-card"><div class="kpi-label">Total de Pedidos</div><div class="kpi-value">${orders.length}</div></div>`;
            }

            // ── Filtro ────────────────────────────────────────────────────────────

            function getFiltered() {
                const q = searchInput.value.trim().toLowerCase();
                const s = statusFilter.value;
                return _allOrders.filter(o => {
                    if (s && o.status !== s) return false;
                    if (!q) return true;
                    return [o.id, o.customer_name, o.customer_email].filter(Boolean).join(' ').toLowerCase().includes(q);
                });
            }

            // ── Renderização ──────────────────────────────────────────────────────

            function renderOrders(orders) {
                if (!orders.length) {
                    ordersArea.innerHTML = '<div class="empty-state">Nenhum pedido encontrado.</div>';
                    return;
                }

                const rows = orders.map(o => {
                    const novinho   = isNew(o);
                    const expanded  = _expandedRows.has(o.id);
                    const mpId      = o.mp_payment_id || '';

                    // Itens do pedido para o detalhe expandido
                    const itemsList = Array.isArray(o.items) && o.items.length
                        ? o.items.map(i => `<li>${i.name||i.id}${i.quantity>1?` ×${i.quantity}`:''}${i.variant?` <em>(${i.variant})</em>`:''}</li>`).join('')
                        : '<li style="color:#52525b">Sem itens registrados</li>';

                    return `
                    <tr data-order-row="${o.id}" class="${novinho?'row-new':''}">
                        <td data-label="Pedido">
                            <button class="expand-btn" data-expand="${o.id}" title="Ver itens" aria-label="Alternar detalhes do pedido">${expanded?'▼':'▶'}</button>
                            <strong> ${o.id}</strong>
                            ${novinho?'<span class="badge-new">NOVO</span>':''}
                        </td>
                        <td data-label="Data">${new Date(o.created_at).toLocaleString('pt-BR')}</td>
                        <td data-label="Cliente">
                            ${o.customer_name||'—'}<br>
                            <span style="color:#71717a">${o.customer_email||''}</span>
                            ${o.customer_phone ? `<br><span style="color:#a1a1aa;font-size:11px">📞 ${o.customer_phone}</span>` : ''}
                            <br>
                            <span class="status-pill ${o.customer_is_student ? 'status-approved' : 'status-rejected'}" style="font-size: 10px; padding: 1px 6px; display: inline-block; margin-top: 3px;">
                                ${o.customer_is_student ? '🎓 Aluno' : '👤 Não Aluno'}
                            </span>
                        </td>
                        <td data-label="Método">${(o.method||'').toUpperCase()}</td>
                        <td data-label="Total">${money.format(o.total)}</td>
                        <td data-label="Status"><span class="status-pill status-${o.status}">${statusLabel(o.status)}</span></td>
                        <td data-label="XP">+${o.earned_xp||0}</td>
                        <td data-label="Ação">
                            <select class="status-select" data-order-id="${o.id}">
                                ${Object.keys(STATUS_LABELS).map(s=>`<option value="${s}"${s===o.status?' selected':''}>${STATUS_LABELS[s]}</option>`).join('')}
                            </select>
                        </td>
                    </tr>
                    <tr class="detail-row${expanded?' open':''}" data-detail-for="${o.id}">
                        <td colspan="8">
                            <div class="detail-inner">
                                <div class="detail-section">
                                    <h4>Itens do pedido</h4>
                                    <ul class="detail-items">${itemsList}</ul>
                                </div>
                                <div class="detail-section">
                                    <h4>Verificar no Mercado Pago</h4>
                                    ${mpId
                                        ? `<button class="btn-mp" data-mp-id="${mpId}" data-mp-container="mp-${o.id}">🔍 Consultar status real (ID: ${mpId})</button>
                                           <div id="mp-${o.id}" class="mp-result" style="display:none"></div>`
                                        : '<span style="color:#52525b;font-size:12px">ID do MP não registrado neste pedido.</span>'
                                    }
                                </div>
                            </div>
                        </td>
                    </tr>`;
                }).join('');

                ordersArea.innerHTML = `
                    <table>
                        <thead>
                            <tr>
                                <th>Pedido</th><th>Data</th><th>Cliente</th><th>Método</th>
                                <th>Total</th><th>Status</th><th>XP</th><th>Ação</th>
                            </tr>
                        </thead>
                        <tbody>${rows}</tbody>
                    </table>`;

                // Expandir/recolher detalhe
                ordersArea.querySelectorAll('.expand-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const id      = btn.dataset.expand;
                        const detail  = ordersArea.querySelector(`[data-detail-for="${id}"]`);
                        const isOpen  = detail.classList.contains('open');
                        if (isOpen) { _expandedRows.delete(id); } else { _expandedRows.add(id); }
                        detail.classList.toggle('open', !isOpen);
                        btn.textContent = isOpen ? '▶' : '▼';
                    });
                });

                // Botão verificar no MP
                ordersArea.querySelectorAll('.btn-mp').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const container = document.getElementById(btn.dataset.mpContainer);
                        container.style.display = 'block';
                        verifyMpPayment(btn.dataset.mpId, container);
                    });
                });

                // Alterar status
                ordersArea.querySelectorAll('.status-select').forEach(select => {
                    select.addEventListener('change', async e => {
                        const orderId   = e.target.dataset.orderId;
                        const newStatus = e.target.value;
                        const row       = ordersArea.querySelector(`[data-order-row="${orderId}"]`);
                        row?.classList.add('row-saving');
                        try {
                            const updated = await updateOrderStatus(orderId, newStatus);
                            const idx = _allOrders.findIndex(o => o.id === orderId);
                            if (idx !== -1 && updated) _allOrders[idx] = { ..._allOrders[idx], status: newStatus };
                            showToast(`Pedido ${orderId} → "${statusLabel(newStatus)}"`);
                            renderKpis(_allOrders);
                            renderOrders(getFiltered());
                        } catch (err) {
                            showToast('Erro: ' + err.message);
                            row?.classList.remove('row-saving');
                        }
                    });
                });
            }

            function applyFiltersAndRender() { renderOrders(getFiltered()); }

            // ── CSV ───────────────────────────────────────────────────────────────

            function exportCsv() {
                const orders = getFiltered();
                if (!orders.length) { showToast('Nenhum pedido para exportar.'); return; }
                const header = ['ID','Data','Cliente','E-mail','Telefone','Aluno','Método','Total','Status','XP'];
                const rows   = orders.map(o => [
                    o.id, new Date(o.created_at).toLocaleString('pt-BR'),
                    o.customer_name||'', o.customer_email||'', o.customer_phone||'',
                    o.customer_is_student ? 'Sim' : 'Não',
                    (o.method||'').toUpperCase(), Number(o.total).toFixed(2).replace('.',','),
                    statusLabel(o.status), o.earned_xp||0,
                ]);
                const csv  = [header,...rows].map(l=>l.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(';')).join('\r\n');
                const blob = new Blob(['\ufeff'+csv], { type:'text/csv;charset=utf-8;' });
                const url  = URL.createObjectURL(blob);
                const a    = Object.assign(document.createElement('a'), { href:url, download:`pedidos-bruna-mandz-${new Date().toISOString().slice(0,10)}.csv` });
                document.body.appendChild(a); a.click(); document.body.removeChild(a);
                URL.revokeObjectURL(url);
                showToast('✅ CSV exportado!');
            }


            // ── Produtos (Fase C) ─────────────────────────────────────────────────────

            async function fetchProducts() {
                const res = await fetch('/api/admin-products', { headers: { 'x-admin-password': _password } });
                if (!res.ok) throw new Error('Erro ao buscar produtos.');
                return res.json();
            }

            async function saveProduct(id, fields, card) {
                const btn    = card.querySelector('.btn-save-product');
                const result = card.querySelector('.save-result');
                btn.disabled = true;
                btn.textContent = 'Salvando…';
                card.classList.add('saving');
                result.textContent = '';
                result.className = 'save-result';
                try {
                    const res = await fetch('/api/admin-products', {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json', 'x-admin-password': _password },
                        body: JSON.stringify({ id, ...fields }),
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error || 'Erro ao salvar.');
                    const idx = _allProducts.findIndex(p => p.id === id);
                    if (idx !== -1) _allProducts[idx] = data.product;
                    card.classList.toggle('inactive', !data.product.active);
                    btn.textContent = 'Salvo!';
                    btn.classList.add('saved');
                    result.textContent = '✅ Alterações salvas.';
                    result.className = 'save-result ok';
                    renderProductsTab();
                } catch (err) {
                    result.textContent = '❌ ' + err.message;
                    result.className = 'save-result err';
                    btn.textContent = 'Tentar novamente';
                } finally {
                    btn.disabled = false;
                    card.classList.remove('saving');
                    setTimeout(() => {
                        btn.classList.remove('saved');
                        btn.textContent = 'Salvar alterações';
                        result.textContent = '';
                        result.className = 'save-result';
                    }, 2500);
                }
            }

            function getFilteredProducts() {
                const term = _productFilters.search.trim().toLowerCase();
                return _allProducts.filter((p) => {
                    const matchesSearch = !term || [p.name, p.description, p.category, p.badge].filter(Boolean).join(' ').toLowerCase().includes(term);
                    const matchesCategory = !_productFilters.category || p.category === _productFilters.category;
                    const matchesStatus = !_productFilters.status || (_productFilters.status === 'active' ? p.active : !p.active);
                    return matchesSearch && matchesCategory && matchesStatus;
                });
            }

            async function createProduct(productData) {
                const password = getPassword();
                if (!password) throw new Error('Sessão expirada');

                const response = await fetch('/api/admin-products', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-admin-password': password,
                    },
                    body: JSON.stringify(productData),
                });

                const result = await response.json();
                if (!response.ok) throw new Error(result.error || 'Erro ao criar produto');
                return result.product;
            }

            function openNewProductModal() {
                const modal = document.getElementById('modal-new-product');
                modal.style.display = 'flex';
                document.getElementById('form-new-product').reset();
                document.getElementById('form-status').textContent = '';
            }

            function closeNewProductModal() {
                const modal = document.getElementById('modal-new-product');
                modal.style.display = 'none';
            }

            function renderProductsTab() {
                const area = document.getElementById('products-area');
                const summary = document.getElementById('products-summary');
                const filtered = getFilteredProducts();
                if (!filtered.length) {
                    area.innerHTML = '<div class="empty-state">Nenhum produto encontrado com esses filtros.</div>';
                    if (summary) summary.textContent = '0 de ' + _allProducts.length + ' produtos';
                    return;
                }
                const catLabel = c => ({ roupas: 'Roupas', acessorios: 'Acessórios', kits: 'Kits' }[c] || c);
                area.innerHTML = '<div class="products-grid">' + filtered.map(p => `
                    <div class="product-admin-card${p.active ? '' : ' inactive'}" data-product-id="${p.id}">
                        <img class="product-admin-img" src="${p.image}" alt="${p.name}" onerror="this.style.opacity='.2'" />
                        <div class="product-admin-info">
                            <div class="product-admin-name" title="${p.name}">${p.name}</div>
                            <div class="product-admin-cat">${catLabel(p.category)}</div>
                            <div class="product-admin-fields">
                                <div class="field-row">
                                    <span class="field-label">Nome</span>
                                    <input class="field-input" type="text" data-field="name" value="${p.name || ''}" />
                                </div>
                                <div class="field-row">
                                    <span class="field-label">Descrição</span>
                                </div>
                                <textarea class="field-textarea" data-field="description">${p.description || ''}</textarea>
                                <div class="field-row">
                                    <span class="field-label">Preço</span>
                                    <input class="field-input" type="number" step="0.01" min="0"
                                        data-field="price" value="${Number(p.price).toFixed(2)}" />
                                </div>
                                <div class="field-row">
                                    <span class="field-label">Estoque</span>
                                    <input class="field-input" type="number" step="1" min="0"
                                        data-field="stock" value="${p.stock}" />
                                </div>
                                <div class="field-row">
                                    <span class="field-label">Categoria</span>
                                    <select class="field-select" data-field="category">
                                        ${['roupas','acessorios','kits'].map(c => `<option value="${c}" ${p.category===c?'selected':''}>${catLabel(c)}</option>`).join('')}
                                    </select>
                                </div>
                                <div class="field-row">
                                    <span class="field-label">Badge</span>
                                    <select class="field-select" data-field="badge">
                                        <option value="" ${!p.badge ? 'selected' : ''}>Nenhum</option>
                                        <option value="Novidade" ${p.badge === 'Novidade' ? 'selected' : ''}>Novidade (Roxo)</option>
                                        <option value="Promoção" ${p.badge === 'Promoção' ? 'selected' : ''}>Promoção (Verde)</option>
                                        <option value="Limitado" ${p.badge === 'Limitado' ? 'selected' : ''}>Limitado (Laranja)</option>
                                    </select>
                                </div>
                                <div class="field-row">
                                    <span class="field-label">Tamanhos</span>
                                    <input class="field-input" type="text" placeholder="Ex: P, M, G, GG (vazio se s/ tamanho)"
                                        data-field="sizes" value="${p.variants?.sizes ? p.variants.sizes.join(', ') : ''}" />
                                </div>
                                <div class="field-row">
                                    <span class="field-label">Imagem</span>
                                    <input class="field-input" type="text" placeholder="/imagem.png"
                                        data-field="image" value="${p.image || ''}" />
                                </div>
                                <div class="field-row" style="gap:4px">
                                    <button class="btn-upload-img" style="flex:0;padding:4px 10px;border-radius:6px;border:1px solid #3f3f46;background:#18181b;color:#a1a1aa;font-size:12px;cursor:pointer;transition:all .2s">📁 Upload</button>
                                    <span class="upload-status" data-upload-id="${p.id}" style="font-size:11px;color:#71717a;"></span>
                                </div>
                                <label class="toggle-active">
                                    <input type="checkbox" data-field="active" ${p.active ? 'checked' : ''} />
                                    Produto ativo (visível na loja)
                                </label>
                            </div>
                            <button class="btn-save-product">Salvar alterações</button>
                            <div class="save-result"></div>
                        </div>
                    </div>`).join('') + '</div>';

                if (summary) summary.textContent = filtered.length + ' de ' + _allProducts.length + ' produtos';

                area.querySelectorAll('.product-admin-card').forEach(card => {
                    card.querySelector('.btn-save-product').addEventListener('click', () => {
                        const id = card.dataset.productId;
                        
                        const badgeVal = card.querySelector('[data-field="badge"]').value || null;
                        let badgeColorVal = null;
                        if (badgeVal === 'Novidade') badgeColorVal = 'purple';
                        else if (badgeVal === 'Promoção') badgeColorVal = 'green';
                        else if (badgeVal === 'Limitado') badgeColorVal = 'orange';

                        const sizesVal = card.querySelector('[data-field="sizes"]').value.trim();
                        const variantsVal = sizesVal ? { sizes: sizesVal.split(',').map(s => s.trim()).filter(Boolean) } : null;

                        const fields = {
                            name: card.querySelector('[data-field="name"]').value.trim(),
                            description: card.querySelector('[data-field="description"]').value.trim(),
                            price: Number(card.querySelector('[data-field="price"]').value),
                            stock: Number(card.querySelector('[data-field="stock"]').value),
                            category: card.querySelector('[data-field="category"]').value,
                            badge: badgeVal,
                            badge_color: badgeColorVal,
                            image: card.querySelector('[data-field="image"]').value.trim() || null,
                            active: card.querySelector('[data-field="active"]').checked,
                            variants: variantsVal,
                        };
                        saveProduct(id, fields, card);
                    });

                    card.querySelector('.btn-upload-img').addEventListener('click', () => {
                        const fileInput = document.getElementById('global-image-upload');
                        fileInput.dataset.targetCard = card.dataset.productId;
                        fileInput.click();
                    });
                });
            }

            let cropper = null;
            let currentProductCard = null;

            async function uploadProductImage(file, productCard) {
                if (!file || !file.type.startsWith('image/')) {
                    alert('Selecione uma imagem válida');
                    return;
                }

                // Abrir modal de crop
                currentProductCard = productCard;
                const modal = document.getElementById('modal-crop');
                const cropImage = document.getElementById('crop-image');
                
                // Criar URL temporária para preview
                const imageUrl = URL.createObjectURL(file);
                cropImage.src = imageUrl;
                
                // Destruir cropper anterior se existir
                if (cropper) {
                    cropper.destroy();
                }
                
                // Inicializar Cropper.js
                cropper = new Cropper(cropImage, {
                    aspectRatio: 1, // Quadrado 1:1
                    viewMode: 1,
                    autoCropArea: 0.8,
                    responsive: true,
                    checkCrossOrigin: false,
                });
                
                // Mostrar modal
                modal.style.display = 'flex';
            }

            // Handler para confirmar crop e fazer upload
            document.getElementById('btn-confirm-crop').addEventListener('click', async () => {
                if (!cropper || !currentProductCard) return;
                
                const statusSpan = currentProductCard.querySelector('.upload-status');
                const uploadBtn = currentProductCard.querySelector('.btn-upload-img');
                const imageInput = currentProductCard.querySelector('[data-field="image"]');
                const modal = document.getElementById('modal-crop');

                statusSpan.textContent = '📤 Enviando...';
                statusSpan.style.color = '#a1a1aa';
                uploadBtn.disabled = true;
                uploadBtn.style.opacity = '.5';

                try {
                    // Obter canvas cropado
                    const canvas = cropper.getCroppedCanvas({
                        maxWidth: 800,
                        maxHeight: 800,
                        imageSmoothingQuality: 'high',
                    });
                    
                    // Converter para blob com compressão
                    canvas.toBlob(async (blob) => {
                        if (!blob) throw new Error('Erro ao processar imagem');
                        
                        const formData = new FormData();
                        formData.append('file', new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' }));

                        const password = getPassword();
                        if (!password) throw new Error('Sessão expirada');

                        const response = await fetch('/api/upload-image', {
                            method: 'POST',
                            headers: { 'x-admin-password': password },
                            body: formData,
                        });

                        const result = await response.json();
                        if (!response.ok) throw new Error(result.error || 'Erro no upload');

                        imageInput.value = result.url;
                        statusSpan.textContent = '✅ Enviado!';
                        statusSpan.style.color = '#86efac';
                        
                        // Atualizar preview da imagem
                        const imgPreview = currentProductCard.querySelector('.product-admin-img');
                        if (imgPreview) imgPreview.src = result.url;
                        
                        // Fechar modal e limpar
                        modal.style.display = 'none';
                        cropper.destroy();
                        cropper = null;
                        currentProductCard = null;
                        
                        setTimeout(() => {
                            statusSpan.textContent = '';
                        }, 2000);
                    }, 'image/jpeg', 0.8); // 80% qualidade
                } catch (err) {
                    statusSpan.textContent = '❌ ' + (err.message || 'Erro').substring(0, 30);
                    statusSpan.style.color = '#fca5a5';
                    setTimeout(() => {
                        statusSpan.textContent = '';
                    }, 3000);
                } finally {
                    uploadBtn.disabled = false;
                    uploadBtn.style.opacity = '1';
                }
            });

            // Handler para cancelar crop
            document.getElementById('btn-cancel-crop').addEventListener('click', () => {
                const modal = document.getElementById('modal-crop');
                modal.style.display = 'none';
                if (cropper) {
                    cropper.destroy();
                    cropper = null;
                }
                currentProductCard = null;
            });

            // Upload de imagem para novo produto (modal)
            async function uploadProductImageForNewProduct(file) {
                if (!file || !file.type.startsWith('image/')) {
                    alert('Selecione uma imagem válida');
                    return;
                }

                const statusSpan = document.getElementById('new-product-upload-status');
                const imageInput = document.querySelector('#form-new-product [name="image"]');
                const previewDiv = document.getElementById('new-product-image-preview');
                const previewImg = document.getElementById('new-product-preview-img');

                // Abrir modal de crop
                const modal = document.getElementById('modal-crop');
                const cropImage = document.getElementById('crop-image');
                
                // Criar URL temporária para preview
                const imageUrl = URL.createObjectURL(file);
                cropImage.src = imageUrl;
                
                // Destruir cropper anterior se existir
                if (cropper) {
                    cropper.destroy();
                }
                
                // Inicializar Cropper.js
                cropper = new Cropper(cropImage, {
                    aspectRatio: 1,
                    viewMode: 1,
                    autoCropArea: 0.8,
                    responsive: true,
                    checkCrossOrigin: false,
                });
                
                // Mostrar modal
                modal.style.display = 'flex';

                // Sobrescrever handler de confirmação para novo produto
                const confirmHandler = async () => {
                    if (!cropper) return;
                    
                    statusSpan.textContent = '📤 Enviando...';
                    statusSpan.style.color = '#a1a1aa';

                    try {
                        // Obter canvas cropado
                        const canvas = cropper.getCroppedCanvas({
                            maxWidth: 800,
                            maxHeight: 800,
                            imageSmoothingQuality: 'high',
                        });
                        
                        // Converter para blob com compressão
                        canvas.toBlob(async (blob) => {
                            if (!blob) throw new Error('Erro ao processar imagem');
                            
                            const formData = new FormData();
                            formData.append('file', new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' }));

                            const password = getPassword();
                            if (!password) throw new Error('Sessão expirada');

                            const response = await fetch('/api/upload-image', {
                                method: 'POST',
                                headers: { 'x-admin-password': password },
                                body: formData,
                            });

                            const result = await response.json();
                            if (!response.ok) throw new Error(result.error || 'Erro no upload');

                            // Atualizar campo de imagem no form
                            imageInput.value = result.url;
                            
                            // Mostrar preview
                            previewImg.src = result.url;
                            previewDiv.style.display = 'block';
                            
                            statusSpan.textContent = '✅ Enviado!';
                            statusSpan.style.color = '#86efac';
                            
                            // Fechar modal e limpar
                            modal.style.display = 'none';
                            cropper.destroy();
                            cropper = null;
                            
                            // Remover handler temporário
                            document.getElementById('btn-confirm-crop').removeEventListener('click', confirmHandler);
                            
                            setTimeout(() => {
                                statusSpan.textContent = '';
                            }, 2000);
                        }, 'image/jpeg', 0.8);
                    } catch (err) {
                        statusSpan.textContent = '❌ ' + (err.message || 'Erro').substring(0, 30);
                        statusSpan.style.color = '#fca5a5';
                        setTimeout(() => {
                            statusSpan.textContent = '';
                        }, 3000);
                    }
                };

                // Adicionar handler temporário
                document.getElementById('btn-confirm-crop').addEventListener('click', confirmHandler);
                
                // Handler de cancelar para novo produto
                const cancelHandler = () => {
                    modal.style.display = 'none';
                    if (cropper) {
                        cropper.destroy();
                        cropper = null;
                    }
                    document.getElementById('btn-cancel-crop').removeEventListener('click', cancelHandler);
                    document.getElementById('btn-confirm-crop').removeEventListener('click', confirmHandler);
                };
                
                document.getElementById('btn-cancel-crop').addEventListener('click', cancelHandler);
            }

            async function uploadProductImageLegacy(file, productCard) {
                // Função legada mantida para compatibilidade
                if (!file || !file.type.startsWith('image/')) {
                    alert('Selecione uma imagem válida');
                    return;
                }
                const statusSpan = productCard.querySelector('.upload-status');
                const uploadBtn = productCard.querySelector('.btn-upload-img');
                const imageInput = productCard.querySelector('[data-field="image"]');

                statusSpan.textContent = '📤 Enviando...';
                statusSpan.style.color = '#a1a1aa';
                uploadBtn.disabled = true;
                uploadBtn.style.opacity = '.5';

                try {
                    const formData = new FormData();
                    formData.append('file', file);

                    const password = getPassword();
                    if (!password) throw new Error('Sessão expirada');

                    const response = await fetch('/api/upload-image', {
                        method: 'POST',
                        headers: { 'x-admin-password': password },
                        body: formData,
                    });

                    const result = await response.json();
                    if (!response.ok) throw new Error(result.error || 'Erro no upload');

                    imageInput.value = result.url;
                    statusSpan.textContent = '✅ Enviado!';
                    statusSpan.style.color = '#86efac';
                    setTimeout(() => {
                        statusSpan.textContent = '';
                    }, 2000);
                } catch (err) {
                    statusSpan.textContent = '❌ ' + (err.message || 'Erro').substring(0, 30);
                    statusSpan.style.color = '#fca5a5';
                    setTimeout(() => {
                        statusSpan.textContent = '';
                    }, 3000);
                } finally {
                    uploadBtn.disabled = false;
                    uploadBtn.style.opacity = '1';
                }
            }

            async function loadProducts() {
                document.getElementById('products-area').innerHTML = '<div class="empty-state">Carregando produtos…</div>';
                try {
                    const { products } = await fetchProducts();
                    _allProducts = products;
                    renderProductsTab();
                } catch (err) {
                    document.getElementById('products-area').innerHTML = '<div class="empty-state">❌ ' + err.message + '</div>';
                }
            }

            // ── Módulo Financeiro (Etapa 33) ──────────────────────────────────────────

            let _activeSubTab = 'students';
            let _allStudents = [];
            let _allTeachers = [];
            let _allTuitions = [];
            let _allPayments = [];
            let _allExpenses = [];
            let _allInvestments = [];
            let _periodInitialized = false;

            function initFinancialPeriodFilter() {
                if (_periodInitialized) return;
                const monthSel = document.getElementById('fin-month-filter');
                const yearSel = document.getElementById('fin-year-filter');
                
                const now = new Date();
                const currentMonth = now.getMonth() + 1;
                const currentYear = now.getFullYear();

                monthSel.innerHTML = '';
                const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
                monthNames.forEach((name, i) => {
                     const opt = document.createElement('option');
                     opt.value = i + 1;
                     opt.textContent = name;
                     if (i + 1 === currentMonth) opt.selected = true;
                     monthSel.appendChild(opt);
                });

                yearSel.innerHTML = '';
                for (let y = currentYear - 1; y <= currentYear + 1; y++) {
                     const opt = document.createElement('option');
                     opt.value = y;
                     opt.textContent = y;
                     if (y === currentYear) opt.selected = true;
                     yearSel.appendChild(opt);
                }

                _periodInitialized = true;

                // Eventos de alteração de período
                monthSel.addEventListener('change', loadFinancialData);
                yearSel.addEventListener('change', loadFinancialData);
                document.getElementById('btn-refresh-financial').addEventListener('click', loadFinancialData);
            }

            async function loadFinancialData() {
                const month = document.getElementById('fin-month-filter').value;
                const year = document.getElementById('fin-year-filter').value;

                // KPIs
                await loadFinancialSummary(month, year);

                // Sub-aba
                switch (_activeSubTab) {
                    case 'students':
                        await loadStudents();
                        break;
                    case 'teachers':
                        await loadTeachers();
                        break;
                    case 'enrollments':
                        await loadEnrollments();
                        break;
                    case 'agenda':
                        await loadAgenda();
                        break;
                    case 'tuitions':
                        await loadTuitions(month, year);
                        break;
                    case 'teacherpayments':
                        await loadTeacherPayments(month, year);
                        break;
                    case 'payments':
                        await loadPayments(month, year);
                        break;
                    case 'expenses':
                        await loadExpensesAndInvestments(month, year);
                        break;
                }
            }

            async function loadFinancialSummary(month, year) {
                try {
                    const res = await fetch(`/api/admin-financial?resource=summary&month=${month}&year=${year}`, {
                        headers: { 'x-admin-password': _password }
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error);

                     const s = data.summary;
                     document.getElementById('fin-kpi-revenue').textContent = money.format(s.revenue);
                     document.getElementById('fin-kpi-outgoings').textContent = money.format(s.outgoings);
                     document.getElementById('fin-kpi-balance').textContent = money.format(s.balance);
                     document.getElementById('fin-kpi-balance').className = 'kpi-value ' + (s.balance >= 0 ? 'good' : 'warn');
                     document.getElementById('fin-kpi-pending').textContent = money.format(s.pending_tuitions);
                     document.getElementById('fin-kpi-overdue-students').textContent = s.overdue_students;
                     document.getElementById('fin-kpi-overdue-students').className = 'kpi-value ' + (s.overdue_students > 0 ? 'warn' : '');
                     document.getElementById('fin-kpi-pending-teacher-payments').textContent = money.format(s.pending_teacher_payments || 0);
                } catch (e) {
                     showToast('Erro ao carregar resumo financeiro: ' + e.message);
                }
            }

            // Sub-aba: Alunos
            async function loadStudents() {
                const area = document.getElementById('students-area');
                area.innerHTML = '<div class="empty-state">Carregando alunos...</div>';
                try {
                    const res = await fetch('/api/admin-financial?resource=students', { headers: { 'x-admin-password': _password } });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error);
                    _allStudents = data.students;
                    renderStudents();
                } catch (err) {
                    area.innerHTML = `<div class="empty-state">❌ Erro: ${err.message}</div>`;
                }
            }

            function renderStudents() {
                const area = document.getElementById('students-area');
                const searchVal = document.getElementById('student-search-input').value.toLowerCase().trim();
                
                const filtered = _allStudents.filter(s => 
                    !searchVal || 
                    [s.name, s.email, s.phone, s.address, s.instruments].filter(Boolean).join(' ').toLowerCase().includes(searchVal)
                );

                if (!filtered.length) {
                    area.innerHTML = '<div class="empty-state">Nenhum aluno cadastrado ou encontrado.</div>';
                    return;
                }

                const rows = filtered.map(s => `
                    <tr>
                        <td data-label="ID"><strong>${s.id}</strong></td>
                        <td data-label="Nome"><strong>${s.name}</strong></td>
                        <td data-label="E-mail">${s.email || '—'}</td>
                        <td data-label="Telefone">${s.phone || '—'}</td>
                        <td data-label="Instrumento">${s.instruments || 'u2014'}</td>
                        <td data-label="Status">
                            <span class="status-pill ${s.active ? 'status-approved' : 'status-rejected'}">
                                ${s.active ? 'Ativo' : 'Inativo'}
                            </span>
                        </td>
                        <td data-label="Ações">
                            <button class="btn-action-small btn-edit-student" data-id="${s.id}">Editar</button>
                            <button class="btn-action-small btn-action-danger btn-delete-student" data-id="${s.id}">Excluir</button>
                        </td>
                    </tr>
                `).join('');

                area.innerHTML = `
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th><th>Nome</th><th>E-mail</th><th>Telefone</th><th>Instrumento</th><th>Status</th><th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>${rows}</tbody>
                    </table>
                `;

                // Eventos
                area.querySelectorAll('.btn-edit-student').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const student = _allStudents.find(s => s.id === btn.dataset.id);
                        if (student) openStudentModal(student);
                    });
                });

                area.querySelectorAll('.btn-delete-student').forEach(btn => {
                    btn.addEventListener('click', async () => {
                        if (!confirm('Deseja excluir permanentemente este aluno e todas as suas mensalidades?')) return;
                        try {
                            const res = await fetch(`/api/admin-financial?resource=students&id=${btn.dataset.id}`, {
                                method: 'DELETE',
                                headers: { 'x-admin-password': _password }
                            });
                            if (!res.ok) {
                                const data = await res.json();
                                throw new Error(data.error);
                            }
                            showToast('Aluno excluído!');
                            loadFinancialData();
                        } catch (e) {
                            showToast('Erro ao excluir: ' + e.message);
                        }
                    });
                });
            }

            // Sub-aba: Professores
            async function loadTeachers() {
                const area = document.getElementById('teachers-area');
                area.innerHTML = '<div class="empty-state">Carregando professores...</div>';
                try {
                    const res = await fetch('/api/admin-financial?resource=teachers', { headers: { 'x-admin-password': _password } });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error);
                    _allTeachers = data.teachers;
                    renderTeachers();
                } catch (err) {
                    area.innerHTML = `<div class="empty-state">❌ Erro: ${err.message}</div>`;
                }
            }

            function renderTeachers() {
                const area = document.getElementById('teachers-area');
                const searchVal = document.getElementById('teacher-search-input').value.toLowerCase().trim();

                const filtered = _allTeachers.filter(t =>
                    !searchVal ||
                    [t.name, t.phone, t.specialty].filter(Boolean).join(' ').toLowerCase().includes(searchVal)
                );

                if (!filtered.length) {
                    area.innerHTML = '<div class="empty-state">Nenhum professor cadastrado ou encontrado.</div>';
                    return;
                }

                const dayMap = { seg: 'Seg', ter: 'Ter', qua: 'Qua', qui: 'Qui', sex: 'Sex', sab: 'Sáb', dom: 'Dom' };
                const rows = filtered.map(t => {
                    const days = t.days_of_week && Array.isArray(t.days_of_week) ? t.days_of_week.map(d => dayMap[d] || d).join(', ') : '—';
                    return `
                        <tr>
                            <td data-label="ID"><strong>${t.id}</strong></td>
                            <td data-label="Nome"><strong>${t.name}</strong></td>
                            <td data-label="Telefone">${t.phone || '—'}</td>
                            <td data-label="Especialidade">${t.specialty || '—'}</td>
                            <td data-label="Dias">${days}</td>
                            <td data-label="Valor/Aula">${money.format(t.rate_per_class || 0)}</td>
                            <td data-label="Ações">
                                <button class="btn-action-small btn-edit-teacher" data-id="${t.id}">Editar</button>
                                <button class="btn-action-small btn-action-danger btn-delete-teacher" data-id="${t.id}">Excluir</button>
                            </td>
                        </tr>
                    `;
                }).join('');

                area.innerHTML = `
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th><th>Nome</th><th>Telefone</th><th>Especialidade</th><th>Dias</th><th>Valor/Aula</th><th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>${rows}</tbody>
                    </table>
                `;

                // Eventos
                area.querySelectorAll('.btn-edit-teacher').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const teacher = _allTeachers.find(t => t.id === btn.dataset.id);
                        if (teacher) openTeacherModal(teacher);
                    });
                });

                area.querySelectorAll('.btn-delete-teacher').forEach(btn => {
                    btn.addEventListener('click', async () => {
                        if (!confirm('Deseja excluir este professor? Mensalidades vinculadas ficarão sem professor.')) return;
                        try {
                            const res = await fetch(`/api/admin-financial?resource=teachers&id=${btn.dataset.id}`, {
                                method: 'DELETE',
                                headers: { 'x-admin-password': _password }
                            });
                            if (!res.ok) {
                                const data = await res.json();
                                throw new Error(data.error);
                            }
                            showToast('Professor excluído!');
                            loadTeachers();
                        } catch (e) {
                            showToast('Erro ao excluir: ' + e.message);
                        }
                    });
                });
            }

            function openTeacherModal(teacher = null) {
                const modal = document.getElementById('modal-new-teacher');
                const form = document.getElementById('form-new-teacher');
                form.reset();

                if (teacher) {
                    document.getElementById('teacher-modal-title').textContent = 'Editar Professor';
                    form.querySelector('[name="id"]').value = teacher.id;
                    form.querySelector('[name="name"]').value = teacher.name;
                    form.querySelector('[name="phone"]').value = teacher.phone || '';
                    form.querySelector('[name="specialty"]').value = teacher.specialty || '';
                    form.querySelector('[name="rate_per_class"]').value = teacher.rate_per_class || 0;
                    // Marcar dias da semana
                    if (teacher.days_of_week && Array.isArray(teacher.days_of_week)) {
                        form.querySelectorAll('[name="days_of_week"]').forEach(cb => {
                            cb.checked = teacher.days_of_week.includes(cb.value);
                        });
                    }
                } else {
                    document.getElementById('teacher-modal-title').textContent = 'Novo Professor';
                    form.querySelector('[name="id"]').value = '';
                }

                modal.style.display = 'flex';
            }

            function closeTeacherModal() {
                document.getElementById('modal-new-teacher').style.display = 'none';
            }

            // Sub-aba: Vínculos (enrollments)
            async function loadEnrollments() {
                const area = document.getElementById('enrollments-area');
                area.innerHTML = '<div class="empty-state">Carregando vínculos...</div>';
                try {
                    const status = document.getElementById('enrollment-status-filter').value;
                    const url = '/api/admin-financial?resource=enrollments' + (status ? `&status=${status}` : '');
                    const res = await fetch(url, { headers: { 'x-admin-password': _password } });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error);
                    _allEnrollments = data.enrollments;
                    renderEnrollments();
                } catch (err) {
                    area.innerHTML = `<div class="empty-state">❌ Erro: ${err.message}</div>`;
                }
            }

            function renderEnrollments() {
                const area = document.getElementById('enrollments-area');
                if (!_allEnrollments.length) {
                    area.innerHTML = '<div class="empty-state">Nenhum vínculo cadastrado. Crie um vínculo para poder gerar mensalidades e ver a agenda.</div>';
                    return;
                }

                const rows = _allEnrollments.map(en => {
                    const day = en.day_of_week ? (DAY_MAP[en.day_of_week] || en.day_of_week) : '—';
                    const time = en.class_time ? ` às ${en.class_time}` : '';
                    return `
                        <tr>
                            <td data-label="Aluno"><strong>${en.students?.name || 'Aluno Excluído'}</strong></td>
                            <td data-label="Professor">${en.teachers?.name || '—'}</td>
                            <td data-label="Instrumento">${en.instrument || '—'}</td>
                            
                            <td data-label="Mensalidade">${money.format(en.monthly_fee)}</td>
                            <td data-label="Status"><span class="status-pill ${en.status === 'active' ? 'status-approved' : 'status-rejected'}">${en.status === 'active' ? 'Ativo' : 'Inativo'}</span></td>
                            <td data-label="Ações">
                                <button class="btn-action-small btn-edit-enrollment" data-id="${en.id}">Editar</button>
                                <button class="btn-action-small btn-action-danger btn-delete-enrollment" data-id="${en.id}">Excluir</button>
                            </td>
                        </tr>
                    `;
                }).join('');

                area.innerHTML = `
                    <table>
                        <thead>
                            <tr>
                                <th>Aluno</th><th>Professor</th><th>Instrumento</th><th>Mensalidade</th><th>Status</th><th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>${rows}</tbody>
                    </table>
                `;

                area.querySelectorAll('.btn-edit-enrollment').forEach(btn => {
                    btn.addEventListener('click', async () => {
                        const en = _allEnrollments.find(e => e.id === btn.dataset.id);
                        if (en) await openEnrollmentModal(en);
                    });
                });

                area.querySelectorAll('.btn-delete-enrollment').forEach(btn => {
                    btn.addEventListener('click', async () => {
                        if (!confirm('Deseja excluir este vínculo? Mensalidades já geradas continuam existindo, mas ficam sem vínculo.')) return;
                        try {
                            const res = await fetch(`/api/admin-financial?resource=enrollments&id=${btn.dataset.id}`, {
                                method: 'DELETE',
                                headers: { 'x-admin-password': _password }
                            });
                            if (!res.ok) {
                                const data = await res.json();
                                throw new Error(data.error);
                            }
                            showToast('Vínculo excluído!');
                            loadEnrollments();
                        } catch (e) {
                            showToast('Erro ao excluir: ' + e.message);
                        }
                    });
                });
            }

            async function populateEnrollmentFormSelects() {
                try {
                    const [studentsRes, teachersRes] = await Promise.all([
                        fetch('/api/admin-financial?resource=students', { headers: { 'x-admin-password': _password } }),
                        fetch('/api/admin-financial?resource=teachers', { headers: { 'x-admin-password': _password } })
                    ]);
                    const studentsData = await studentsRes.json();
                    const teachersData = await teachersRes.json();

                    const studentSelect = document.querySelector('#form-new-enrollment [name="student_id"]');
                    studentSelect.innerHTML = '';
                    studentsData.students.filter(s => s.active).forEach(s => {
                        const opt = document.createElement('option');
                        opt.value = s.id; opt.textContent = s.name;
                        studentSelect.appendChild(opt);
                    });

                    const teacherSelect = document.querySelector('#form-new-enrollment [name="teacher_id"]');
                    teacherSelect.innerHTML = '<option value="">Sem professor</option>';
                    teachersData.teachers.forEach(t => {
                        const opt = document.createElement('option');
                        opt.value = t.id; opt.textContent = t.name + (t.specialty ? ` (${t.specialty})` : '');
                        teacherSelect.appendChild(opt);
                    });
                } catch (e) {
                    showToast('Erro ao buscar alunos/professores: ' + e.message);
                }
            }

            async function openEnrollmentModal(enrollment = null) {
                await populateEnrollmentFormSelects();
                const modal = document.getElementById('modal-new-enrollment');
                const form = document.getElementById('form-new-enrollment');
                form.reset();

                if (enrollment) {
                    document.getElementById('enrollment-modal-title').textContent = 'Editar Vínculo';
                    form.querySelector('[name="id"]').value = enrollment.id;
                    form.querySelector('[name="student_id"]').value = enrollment.student_id;
                    form.querySelector('[name="teacher_id"]').value = enrollment.teacher_id || '';
                    form.querySelector('[name="instrument"]').value = enrollment.instrument || '';
                    form.querySelector('[name="day_of_week"]').value = enrollment.day_of_week || '';
                    form.querySelector('[name="class_time"]').value = enrollment.class_time || '';
                    form.querySelector('[name="duration_minutes"]').value = enrollment.duration_minutes;
                    form.querySelector('[name="classes_per_week"]').value = enrollment.classes_per_week;
                    form.querySelector('[name="monthly_fee"]').value = enrollment.monthly_fee;
                    form.querySelector('[name="billing_type"]').value = enrollment.billing_type || 'monthly';
                    form.querySelector('[name="total_amount"]').value = enrollment.total_amount || '';
                    form.querySelector('[name="installments"]').value = enrollment.installments || 1;
                    form.querySelector('[name="status"]').value = enrollment.status;
                    form.querySelector('[name="notes"]').value = enrollment.notes || '';
                } else {
                    document.getElementById('enrollment-modal-title').textContent = 'Novo Vínculo';
                    form.querySelector('[name="id"]').value = '';
                }

                modal.style.display = 'flex';
                updateEnrollmentBillingTypeFields();
            }

            function closeEnrollmentModal() {
                document.getElementById('modal-new-enrollment').style.display = 'none';
            }

            function updateEnrollmentBillingTypeFields() {
                var bt = document.querySelector('#form-new-enrollment [name="billing_type"]');
                var ff = document.getElementById('enrollment-full-fields');
                if (bt && ff) ff.style.display = bt.value === 'full' ? 'block' : 'none';
            }

            // Sub-aba: Agenda (derivada dos vínculos ativos)
            async function loadAgenda() {
                const area = document.getElementById('agenda-area');
                area.innerHTML = '<div class="empty-state">Carregando agenda...</div>';
                try {
                    const res = await fetch('/api/admin-financial?resource=enrollments&status=active', { headers: { 'x-admin-password': _password } });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error);
                    renderAgenda(data.enrollments);
                } catch (err) {
                    area.innerHTML = `<div class="empty-state">❌ Erro: ${err.message}</div>`;
                }
            }

            function renderAgenda(enrollments) {
                const area = document.getElementById('agenda-area');
                if (!enrollments.length) {
                    area.innerHTML = '<div class="empty-state">Nenhum vínculo ativo para exibir na agenda.</div>';
                    return;
                }

                const byDay = {};
                DAY_ORDER.forEach(d => byDay[d] = []);
                const noDay = [];
                enrollments.forEach(en => {
                    if (en.day_of_week && byDay[en.day_of_week]) byDay[en.day_of_week].push(en);
                    else noDay.push(en);
                });

                Object.values(byDay).forEach(list => list.sort((a, b) => (a.class_time || '').localeCompare(b.class_time || '')));

                const dayBlock = (dayKey, label, list) => {
                    if (!list.length) return '';
                    const items = list.map(en => `
                        <li style="padding:8px 0;border-bottom:1px solid #1f1f22;display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap">
                            <span><strong>${en.class_time || '—'}</strong> — ${en.students?.name || 'Aluno Excluído'} (${en.instrument || 'sem instrumento'})</span>
                            <span style="color:#71717a;font-size:12px">👨‍🏫 ${en.teachers?.name || 'sem professor'} · ${en.duration_minutes}min</span>
                        </li>
                    `).join('');
                    return `
                        <div style="background:#18181b;border:1px solid #27272a;border-radius:12px;padding:14px 16px;margin-bottom:12px">
                            <h3 style="margin:0 0 8px;font-size:13px;text-transform:uppercase;letter-spacing:.05em;color:#a1a1aa">${label}</h3>
                            <ul style="list-style:none;padding:0;margin:0">${items}</ul>
                        </div>
                    `;
                };

                let html = DAY_ORDER.map(d => dayBlock(d, DAY_MAP[d], byDay[d])).join('');
                if (noDay.length) html += dayBlock('none', 'Sem dia definido', noDay);

                area.innerHTML = html || '<div class="empty-state">Nenhum vínculo ativo com dia definido.</div>';
            }

            // Sub-aba: Mensalidades
            async function loadTuitions(month, year) {
                const area = document.getElementById('tuitions-area');
                area.innerHTML = '<div class="empty-state">Carregando mensalidades...</div>';
                try {
                    const status = document.getElementById('tuition-status-filter').value;
                    const res = await fetch(`/api/admin-financial?resource=tuitions&month=${month}&year=${year}&status=${status}`, {
                        headers: { 'x-admin-password': _password }
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error);
                    _allTuitions = data.tuitions;

                    // Popular filtro de professores (via vínculo)
                    const teacherFilter = document.getElementById('tuition-teacher-filter');
                    teacherFilter.innerHTML = '<option value="">Todos os professores</option>';
                    const seenTeacherIds = new Set();
                    const teachers = _allTuitions
                        .map(t => t.enrollments?.teachers ? { id: t.enrollments.teacher_id, ...t.enrollments.teachers } : null)
                        .filter(t => t && !seenTeacherIds.has(t.id) && seenTeacherIds.add(t.id));
                    teachers.forEach(t => {
                        const opt = document.createElement('option');
                        opt.value = t.id;
                        opt.textContent = t.name + (t.specialty ? ` (${t.specialty})` : '');
                        teacherFilter.appendChild(opt);
                    });

                    renderTuitions();
                } catch (err) {
                    area.innerHTML = `<div class="empty-state">❌ Erro: ${err.message}</div>`;
                }
            }

            function renderTuitions() {
                const area = document.getElementById('tuitions-area');
                const teacherFilter = document.getElementById('tuition-teacher-filter').value;

                // Filtrar por professor
                const filtered = teacherFilter
                    ? _allTuitions.filter(t => t.enrollments && t.enrollments.teacher_id === teacherFilter)
                    : _allTuitions;

                if (!filtered.length) {
                    area.innerHTML = '<div class="empty-state">Nenhuma mensalidade neste período.</div>';
                    return;
                }

                const statusMap = {
                    pending: { label: 'Pendente', class: 'status-pending' },
                    paid: { label: 'Pago', class: 'status-approved' },
                    overdue: { label: 'Atrasado', class: 'status-rejected' },
                    cancelled: { label: 'Cancelado', class: 'status-refunded' }
                };

                const rows = filtered.map(t => {
                    const finalValue = Number(t.amount) - Number(t.discount_amount);
                    const s = statusMap[t.status] || { label: t.status, class: '' };
                    const paidDate = t.paid_at ? new Date(t.paid_at).toLocaleDateString('pt-BR') : '—';
                    const method = t.payment_method ? t.payment_method.toUpperCase() : '—';
                    const disc = Number(t.discount_amount) > 0 ? `<br><span style="color:#f87171;font-size:11px">Desc: ${money.format(t.discount_amount)} (${t.discount_reason || 'Outro'})</span>` : '';
                    const teacherInfo = t.enrollments?.teachers ? `<br><span style="color:#71717a;font-size:11px">👨‍🏫 ${t.enrollments.teachers.name}</span>` : '';
                    const instrumentInfo = t.enrollments?.instrument ? `<br><span style="color:#71717a;font-size:11px">🎸 ${t.enrollments.instrument}</span>` : '';

                    let actionHtml = '';
                    if (t.status !== 'paid') {
                        actionHtml = `<button class="btn-action-small btn-action-success btn-pay-tuition" data-id="${t.id}">Pagar</button>`;
                    }
                    if (t.status !== 'cancelled') {
                        actionHtml += ` <button class="btn-action-small btn-action-danger btn-cancel-tuition-action" data-id="${t.id}">Cancelar</button>`;
                    }

                    return `
                        <tr>
                            <td data-label="Aluno"><strong>${t.students?.name || 'Aluno Excluído'}</strong>${teacherInfo}${instrumentInfo}</td>
                            <td data-label="Valor">${money.format(t.amount)}${disc}</td>
                            <td data-label="Total">${money.format(finalValue)}</td>
                            <td data-label="Vencimento">${new Date(t.due_date + 'T12:00:00').toLocaleDateString('pt-BR')}</td>
                            <td data-label="Status"><span class="status-pill ${s.class}">${s.label}</span></td>
                            <td data-label="Pagamento">${paidDate} (${method})</td>
                            <td data-label="Ações">${actionHtml}</td>
                        </tr>
                    `;
                }).join('');

                area.innerHTML = `
                    <table>
                        <thead>
                            <tr>
                                <th>Aluno</th><th>Valor</th><th>Líquido</th><th>Vencimento</th><th>Status</th><th>Pagamento</th><th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>${rows}</tbody>
                    </table>
                `;

                // Eventos
                area.querySelectorAll('.btn-pay-tuition').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const form = document.getElementById('form-pay-tuition');
                        form.reset();
                        form.querySelector('[name="tuition_id"]').value = btn.dataset.id;
                        
                        // Preencher data padrão local formato datetime-local
                        const now = new Date();
                        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
                        form.querySelector('[name="paid_at"]').value = now.toISOString().slice(0, 16);

                        document.getElementById('modal-pay-tuition').style.display = 'flex';
                    });
                });

                area.querySelectorAll('.btn-cancel-tuition-action').forEach(btn => {
                    btn.addEventListener('click', async () => {
                        if (!confirm('Deseja cancelar esta mensalidade?')) return;
                        try {
                            const res = await fetch('/api/admin-financial?resource=tuitions', {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json', 'x-admin-password': _password },
                                body: JSON.stringify({ id: btn.dataset.id, status: 'cancelled' })
                            });
                            if (!res.ok) throw new Error('Falha no cancelamento');
                            showToast('Mensalidade cancelada!');
                            loadFinancialData();
                        } catch (e) {
                            showToast(e.message);
                        }
                    });
                });
            }

            // Sub-aba: Receitas Avulsas
            async function loadPayments(month, year) {
                const area = document.getElementById('payments-area');
                area.innerHTML = '<div class="empty-state">Carregando pagamentos...</div>';
                try {
                    const category = document.getElementById('payment-category-filter').value;
                    const res = await fetch(`/api/admin-financial?resource=payments&month=${month}&year=${year}&category=${category}`, {
                        headers: { 'x-admin-password': _password }
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error);
                    _allPayments = data.payments;
                    renderPayments();
                } catch (err) {
                    area.innerHTML = `<div class="empty-state">❌ Erro: ${err.message}</div>`;
                }
            }

            function renderPayments() {
                const area = document.getElementById('payments-area');
                if (!_allPayments.length) {
                    area.innerHTML = '<div class="empty-state">Nenhum pagamento avulso recebido no período.</div>';
                    return;
                }

                const catMap = { matricula: 'Matrícula', material: 'Material', aula_extra: 'Aula Extra', outro: 'Outro' };

                const rows = _allPayments.map(p => `
                    <tr>
                        <td data-label="Aluno"><strong>${p.students?.name || '—'}</strong></td>
                        <td data-label="Descrição">${p.description}</td>
                        <td data-label="Categoria">${catMap[p.category] || p.category}</td>
                        <td data-label="Valor">${money.format(p.amount)}</td>
                        <td data-label="Forma">${p.payment_method.toUpperCase()}</td>
                        <td data-label="Recebimento">${new Date(p.paid_at).toLocaleString('pt-BR')}</td>
                    </tr>
                `).join('');

                area.innerHTML = `
                    <table>
                        <thead>
                            <tr>
                                <th>Aluno</th><th>Descrição</th><th>Categoria</th><th>Valor</th><th>Forma</th><th>Recebimento</th>
                            </tr>
                        </thead>
                        <tbody>${rows}</tbody>
                    </table>
                `;
            }

            // Sub-aba: Pagamentos a Professores
            async function loadTeacherPayments(month, year) {
                const area = document.getElementById('teacherpayments-area');
                area.innerHTML = '<div class="empty-state">Carregando pagamentos a professores...</div>';
                try {
                    const teacherId = document.getElementById('teacherpayment-teacher-filter').value;
                    const paid = document.getElementById('teacherpayment-paid-filter').value;
                    let url = `/api/admin-financial?resource=teacher_payments&month=${month}&year=${year}`;
                    if (teacherId) url += `&teacher_id=${teacherId}`;
                    if (paid !== '') url += `&paid=${paid}`;
                    const res = await fetch(url, { headers: { 'x-admin-password': _password } });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error);
                    _allTeacherPayments = data.teacher_payments;

                    // Popular filtro de professores (uma vez, se ainda vazio)
                    const filterSelect = document.getElementById('teacherpayment-teacher-filter');
                    if (filterSelect.options.length <= 1) {
                        const tRes = await fetch('/api/admin-financial?resource=teachers', { headers: { 'x-admin-password': _password } });
                        const tData = await tRes.json();
                        if (tRes.ok) {
                            tData.teachers.forEach(t => {
                                const opt = document.createElement('option');
                                opt.value = t.id; opt.textContent = t.name;
                                filterSelect.appendChild(opt);
                            });
                        }
                    }

                    renderTeacherPayments();
                } catch (err) {
                    area.innerHTML = `<div class="empty-state">❌ Erro: ${err.message}</div>`;
                }
            }

            function renderTeacherPayments() {
                const area = document.getElementById('teacherpayments-area');
                if (!_allTeacherPayments.length) {
                    area.innerHTML = '<div class="empty-state">Nenhum pagamento a professor neste período.</div>';
                    return;
                }

                const rows = _allTeacherPayments.map(tp => `
                    <tr>
                        <td data-label="Professor"><strong>${tp.teachers?.name || 'Professor Excluído'}</strong></td>
                        <td data-label="Mês Ref.">${new Date(tp.reference_month + 'T12:00:00').toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' })}</td>
                        <td data-label="Valor">${money.format(tp.amount)}</td>
                        <td data-label="Status"><span class="status-pill ${tp.paid ? 'status-approved' : 'status-pending'}">${tp.paid ? 'Pago' : 'Pendente'}</span></td>
                        <td data-label="Pago em">${tp.paid_at ? new Date(tp.paid_at).toLocaleDateString('pt-BR') : '—'}</td>
                        <td data-label="Ações">
                            ${!tp.paid ? `<button class="btn-action-small btn-action-success btn-pay-teacherpayment" data-id="${tp.id}">Marcar Pago</button>` : ''}
                            <button class="btn-action-small btn-action-danger btn-delete-teacherpayment" data-id="${tp.id}">Excluir</button>
                        </td>
                    </tr>
                `).join('');

                area.innerHTML = `
                    <table>
                        <thead>
                            <tr><th>Professor</th><th>Mês Ref.</th><th>Valor</th><th>Status</th><th>Pago em</th><th>Ações</th></tr>
                        </thead>
                        <tbody>${rows}</tbody>
                    </table>
                `;

                area.querySelectorAll('.btn-pay-teacherpayment').forEach(btn => {
                    btn.addEventListener('click', async () => {
                        try {
                            const res = await fetch('/api/admin-financial?resource=teacher_payments', {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json', 'x-admin-password': _password },
                                body: JSON.stringify({ id: btn.dataset.id, paid: true })
                            });
                            if (!res.ok) throw new Error((await res.json()).error);
                            showToast('Pagamento marcado como pago!');
                            loadFinancialData();
                        } catch (e) {
                            showToast('Erro: ' + e.message);
                        }
                    });
                });

                area.querySelectorAll('.btn-delete-teacherpayment').forEach(btn => {
                    btn.addEventListener('click', async () => {
                        if (!confirm('Deseja excluir este pagamento a professor?')) return;
                        try {
                            const res = await fetch(`/api/admin-financial?resource=teacher_payments&id=${btn.dataset.id}`, {
                                method: 'DELETE',
                                headers: { 'x-admin-password': _password }
                            });
                            if (!res.ok) throw new Error((await res.json()).error);
                            showToast('Pagamento excluído!');
                            loadTeacherPayments(document.getElementById('fin-month-filter').value, document.getElementById('fin-year-filter').value);
                        } catch (e) {
                            showToast('Erro ao excluir: ' + e.message);
                        }
                    });
                });
            }

            async function populateTeacherPaymentSelect() {
                try {
                    const res = await fetch('/api/admin-financial?resource=teachers', { headers: { 'x-admin-password': _password } });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error);
                    const select = document.querySelector('#form-new-teacherpayment [name="teacher_id"]');
                    select.innerHTML = '';
                    data.teachers.forEach(t => {
                        const opt = document.createElement('option');
                        opt.value = t.id; opt.textContent = t.name + (t.specialty ? ` (${t.specialty})` : '');
                        select.appendChild(opt);
                    });
                } catch (e) {
                    showToast('Erro ao buscar professores: ' + e.message);
                }
            }

            // Sub-aba: Custos & Investimentos
            async function loadExpensesAndInvestments(month, year) {
                const expArea = document.getElementById('expenses-area');
                const invArea = document.getElementById('investments-area');
                expArea.innerHTML = '<div class="empty-state">Carregando custos...</div>';
                invArea.innerHTML = '<div class="empty-state">Carregando investimentos...</div>';

                try {
                    // Custos
                    const resExp = await fetch(`/api/admin-financial?resource=expenses&month=${month}&year=${year}`, {
                        headers: { 'x-admin-password': _password }
                    });
                     const dataExp = await resExp.json();
                     if (!resExp.ok) throw new Error(dataExp.error);
                     _allExpenses = dataExp.expenses;

                     // Investimentos
                     const resInv = await fetch(`/api/admin-financial?resource=investments&month=${month}&year=${year}`, {
                         headers: { 'x-admin-password': _password }
                     });
                     const dataInv = await resInv.json();
                     if (!resInv.ok) throw new Error(dataInv.error);
                     _allInvestments = dataInv.investments;

                     renderExpenses();
                     renderInvestments();
                } catch (err) {
                     expArea.innerHTML = `<div class="empty-state">❌ Erro: ${err.message}</div>`;
                     invArea.innerHTML = `<div class="empty-state">❌ Erro: ${err.message}</div>`;
                }
            }

            function renderExpenses() {
                const area = document.getElementById('expenses-area');
                if (!_allExpenses.length) {
                    area.innerHTML = '<div class="empty-state">Nenhum custo fixo registrado no período.</div>';
                    return;
                }

                const catMap = { aluguel: 'Aluguel', agua: 'Água', luz: 'Luz', material: 'Materiais', outro: 'Outro' };

                const rows = _allExpenses.map(e => {
                    const statusText = e.paid ? 'Pago' : 'Pendente';
                    const statusClass = e.paid ? 'status-approved' : 'status-pending';
                    const paidDate = e.paid_at ? `<br><span style="color:#86efac;font-size:11px">Pago: ${new Date(e.paid_at).toLocaleDateString('pt-BR')}</span>` : '';

                    const actionHtml = !e.paid 
                        ? `<button class="btn-action-small btn-action-success btn-pay-expense" data-id="${e.id}">Marcar Pago</button>`
                        : '';

                    return `
                        <tr>
                            <td data-label="Descrição"><strong>${e.description}</strong><br><span style="color:#71717a;font-size:11px">${catMap[e.category] || e.category}</span></td>
                            <td data-label="Valor">${money.format(e.amount)}</td>
                            <td data-label="Vencimento">${new Date(e.due_date + 'T12:00:00').toLocaleDateString('pt-BR')}</td>
                            <td data-label="Status"><span class="status-pill ${statusClass}">${statusText}</span>${paidDate}</td>
                            <td data-label="Ações">${actionHtml}</td>
                        </tr>
                    `;
                }).join('');

                area.innerHTML = `
                    <table>
                        <thead>
                            <tr>
                                <th>Descrição</th><th>Valor</th><th>Vencimento</th><th>Status</th><th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>${rows}</tbody>
                    </table>
                `;

                area.querySelectorAll('.btn-pay-expense').forEach(btn => {
                    btn.addEventListener('click', async () => {
                        if (!confirm('Deseja marcar esta despesa como paga na data atual?')) return;
                        try {
                            const res = await fetch('/api/admin-financial?resource=expenses', {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json', 'x-admin-password': _password },
                                body: JSON.stringify({ id: btn.dataset.id, paid: true })
                            });
                            if (!res.ok) throw new Error('Erro ao pagar despesa');
                            showToast('Despesa paga!');
                            loadFinancialData();
                        } catch (err) {
                            showToast(err.message);
                        }
                    });
                });
            }

            function renderInvestments() {
                const area = document.getElementById('investments-area');
                if (!_allInvestments.length) {
                    area.innerHTML = '<div class="empty-state">Nenhum investimento registrado no período.</div>';
                    return;
                }

                const catMap = { instrumento: 'Instrumento', movel: 'Móvel', equipamento: 'Equipamento', outro: 'Outro' };

                const rows = _allInvestments.map(i => {
                    const notesText = i.notes ? `<br><span style="color:#a1a1aa;font-size:11px">obs: ${i.notes}</span>` : '';
                    return `
                        <tr>
                            <td data-label="Descrição"><strong>${i.description}</strong><br><span style="color:#71717a;font-size:11px">${catMap[i.category] || i.category}</span>${notesText}</td>
                            <td data-label="Valor">${money.format(i.amount)}</td>
                            <td data-label="Data">${new Date(i.purchased_at + 'T12:00:00').toLocaleDateString('pt-BR')}</td>
                        </tr>
                    `;
                }).join('');

                area.innerHTML = `
                    <table>
                        <thead>
                            <tr>
                                <th>Descrição</th><th>Valor</th><th>Data Compra</th>
                            </tr>
                        </thead>
                        <tbody>${rows}</tbody>
                    </table>
                `;
            }

            // Modais do Financeiro
            async function openStudentModal(student = null) {
                const modal = document.getElementById('modal-new-student');
                const form = document.getElementById('form-new-student');
                form.reset();
                
                const enrollmentsSection = document.getElementById('student-enrollments-section');
                const enrollmentsList = document.getElementById('student-enrollments-list');
                const btnNewEnrollment = document.getElementById('btn-new-enrollment-for-student');

                if (student) {
                    document.getElementById('student-modal-title').textContent = 'Editar Aluno';
                    form.querySelector('[name="id"]').value = student.id;
                    form.querySelector('[name="name"]').value = student.name;
                    form.querySelector('[name="email"]').value = student.email || '';
                    form.querySelector('[name="phone"]').value = student.phone || '';
                    form.querySelector('[name="address"]').value = student.address || '';
                    form.querySelector('[name="instruments"]').value = student.instruments || '';
                    form.querySelector('[name="guardian_name"]').value = student.guardian_name || '';
                    form.querySelector('[name="guardian_phone"]').value = student.guardian_phone || '';
                    form.querySelector('[name="active"]').checked = student.active;
                    
                    enrollmentsSection.style.display = 'block';
                    btnNewEnrollment.onclick = () => openEnrollmentModalForStudent(student.id);
                    
                    enrollmentsList.innerHTML = '<span style="font-size:12px;color:#71717a">Carregando matrículas...</span>';
                    try {
                        const res = await fetch('/api/admin-financial?resource=enrollments&student_id=' + student.id, { headers: { 'x-admin-password': _password } });
                        const data = await res.json();
                        if(data.enrollments && data.enrollments.length > 0) {
                            enrollmentsList.innerHTML = data.enrollments.map(en => `
                                <div style="display:flex;justify-content:space-between;align-items:center;background:#1e1e21;padding:8px 12px;border-radius:6px;border:1px solid ${en.status==='active'?'#3f3f46':'#dc262620'}">
                                    <div style="font-size:12px">
                                        <div style="color:#e4e4e7;font-weight:600">${en.teachers?.name || 'Sem professor'} <span style="color:#a1a1aa;font-weight:400">(${en.instrument})</span></div>
                                        <div style="color:#a1a1aa">${en.day_of_week || '?'}, ${en.class_time || '?'} - ${en.duration_minutes}min</div>
                                    </div>
                                    <button type="button" onclick='openEnrollmentModal(${JSON.stringify(en).replace(/'/g,"&#39;")})' style="background:none;border:none;color:#3b82f6;cursor:pointer;font-size:12px;font-weight:600">Editar</button>
                                </div>
                            `).join('');
                        } else {
                            enrollmentsList.innerHTML = '<span style="font-size:12px;color:#71717a">Nenhuma matrícula ativa.</span>';
                        }
                    } catch(err) {
                        enrollmentsList.innerHTML = '<span style="font-size:12px;color:#dc2626">Erro ao carregar matrículas.</span>';
                    }

                } else {
                    document.getElementById('student-modal-title').textContent = 'Novo Aluno';
                    form.querySelector('[name="id"]').value = '';
                    form.querySelector('[name="active"]').checked = true;
                    enrollmentsSection.style.display = 'none';
                }
                modal.style.display = 'flex';
            }

            async function openEnrollmentModalForStudent(studentId) {
                await populateEnrollmentFormSelects();
                const modal = document.getElementById('modal-new-enrollment');
                const form = document.getElementById('form-new-enrollment');
                form.reset();
                document.getElementById('enrollment-modal-title').textContent = 'Nova Matrícula';
                form.querySelector('[name="id"]').value = '';
                form.querySelector('[name="student_id"]').value = studentId;
                // Hide the student select since we already know who the student is
                const studentSelectGroup = form.querySelector('[name=student_id]').closest('div');
                if (studentSelectGroup) {
                    studentSelectGroup.style.display = 'none';
                }
                modal.style.display = 'flex';
            }

            function closeStudentModal() {
                document.getElementById('modal-new-student').style.display = 'none';
            }

            async function populateStudentSelects() {
                try {
                    // Buscar alunos
                    const res = await fetch('/api/admin-financial?resource=students', { headers: { 'x-admin-password': _password } });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error);

                    const activeStudents = data.students.filter(s => s.active);

                    const tuitionSelect = document.querySelector('#form-new-tuition [name="student_id"]');
                    const paymentSelect = document.querySelector('#form-new-payment [name="student_id"]');

                    [tuitionSelect, paymentSelect].forEach(select => {
                        if (!select) return;
                        const defaultOpt = select.querySelector('option[value=""]') || document.createElement('option');
                        select.innerHTML = '';
                        if (select === paymentSelect) {
                            defaultOpt.value = '';
                            defaultOpt.textContent = 'Nenhum / Externo';
                            select.appendChild(defaultOpt);
                        }
                        activeStudents.forEach(s => {
                            const opt = document.createElement('option');
                            opt.value = s.id;
                            opt.textContent = s.name;
                            select.appendChild(opt);
                        });
                    });

                } catch (e) {
                    showToast('Erro ao buscar lista de alunos/professores: ' + e.message);
                }
            }

            // Popula o select de Vínculo do form de mensalidade com os vínculos
            // ativos do aluno escolhido, e auto-preenche o valor a partir do
            // monthly_fee do vínculo selecionado.
            async function populateTuitionEnrollmentSelect(studentId) {
                const enrollmentSelect = document.querySelector('#form-new-tuition [name="enrollment_id"]');
                if (!enrollmentSelect) return;
                enrollmentSelect.innerHTML = '<option value="">Mensalidade avulsa (sem vínculo)</option>';
                if (!studentId) return;
                try {
                    const res = await fetch(`/api/admin-financial?resource=enrollments&student_id=${studentId}&status=active`, {
                        headers: { 'x-admin-password': _password }
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error);
                    data.enrollments.forEach(en => {
                        const opt = document.createElement('option');
                        opt.value = en.id;
                        opt.dataset.monthlyFee = en.monthly_fee;
                        opt.textContent = `${en.instrument || 'Aula'} — ${en.teachers?.name || 'sem professor'} (${money.format(en.monthly_fee)})`;
                        enrollmentSelect.appendChild(opt);
                    });
                } catch (e) {
                    showToast('Erro ao buscar vínculos do aluno: ' + e.message);
                }
            }

            function exportPaymentsCsv() {
                if (!_allPayments.length) { showToast('Nenhum faturamento para exportar.'); return; }
                const header = ['Aluno','Descrição','Categoria','Valor','Forma Pagamento','Data Recebimento'];
                const catMap = { matricula: 'Matrícula', material: 'Material', aula_extra: 'Aula Extra', outro: 'Outro' };
                const rows = _allPayments.map(p => [
                    p.students?.name || 'Externo', p.description, catMap[p.category] || p.category,
                    Number(p.amount).toFixed(2).replace('.',','), p.payment_method.toUpperCase(),
                    new Date(p.paid_at).toLocaleString('pt-BR')
                ]);
                const csv = [header,...rows].map(l=>l.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(';')).join('\r\n');
                const blob = new Blob(['\ufeff'+csv], { type:'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const a = Object.assign(document.createElement('a'), { href:url, download:`receitas-escola-${new Date().toISOString().slice(0,10)}.csv` });
                document.body.appendChild(a); a.click(); document.body.removeChild(a);
                URL.revokeObjectURL(url);
                showToast('CSV de receitas exportado!');
            }

            // ── Auto-refresh ──────────────────────────────────────────────────────

            function startAutoRefresh() {
                clearInterval(_timer);
                _countdown = REFRESH_INTERVAL;
                _timer = setInterval(async () => {
                    _countdown--;
                    refreshCounter.innerHTML = `Auto-refresh em <span>${_countdown}s</span>`;
                    if (_countdown <= 0) {
                        _countdown = REFRESH_INTERVAL;
                        try {
                            const { orders } = await fetchOrders(_password);
                            const prevIds = new Set(_allOrders.map(o => o.id));
                            const newOnes = orders.filter(o => !prevIds.has(o.id));
                            _allOrders = orders;
                            renderKpis(_allOrders);
                            applyFiltersAndRender();
                            if (newOnes.length) showToast(`🛍️ ${newOnes.length} novo(s) pedido(s)!`);
                        } catch { /* silencioso — não interrompe o admin */ }
                    }
                }, 1000);
            }

            // ── Login / carregamento ──────────────────────────────────────────────

            async function loadPanel(password) {
                try {
                    const { orders } = await fetchOrders(password);
                    _allOrders = orders;
                    _password  = password;
                    renderKpis(_allOrders);
                    applyFiltersAndRender();
                    bindProductFilters();
                    loginScreen.style.display = 'none';
                    panelScreen.style.display = 'block';
                    sessionStorage.setItem(STORAGE_KEY, password);
                    startAutoRefresh();
                    switchTab('dashboard');
                } catch (err) {
                    loginError.textContent = err.message || 'Não foi possível carregar o painel.';
                }
            }

            // ── Eventos ───────────────────────────────────────────────────────────

            function bindProductFilters() {
                const search = document.getElementById('product-search-input');
                const category = document.getElementById('product-category-filter');
                const status = document.getElementById('product-status-filter');
                if (!search || !category || !status) return;
                [search, category, status].forEach((el) => {
                    el.addEventListener('input', () => {
                        _productFilters = {
                            search: search.value,
                            category: category.value,
                            status: status.value,
                        };
                        renderProductsTab();
                    });
                });
            }

            // ── Upload de Imagem ──────────────────────────────────────────────────

            document.getElementById('global-image-upload').addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                
                const targetProductId = e.target.dataset.targetCard;
                const targetContext = e.target.dataset.targetContext;
                
                if (targetProductId) {
                    // Upload para produto existente
                    const targetCard = document.querySelector(`[data-product-id="${targetProductId}"]`);
                    if (targetCard) {
                        await uploadProductImage(file, targetCard);
                    }
                } else if (targetContext === 'new-product') {
                    // Upload para novo produto (modal)
                    await uploadProductImageForNewProduct(file);
                }
                
                e.target.value = '';
            });

            // ── Novo Produto ──────────────────────────────────────────────────────

            document.getElementById('btn-new-product').addEventListener('click', openNewProductModal);
            document.getElementById('btn-cancel-product').addEventListener('click', closeNewProductModal);
            
            // Upload de imagem no modal de novo produto
            document.getElementById('btn-upload-new-product').addEventListener('click', () => {
                const fileInput = document.getElementById('global-image-upload');
                fileInput.dataset.targetContext = 'new-product';
                fileInput.click();
            });

            document.getElementById('modal-new-product').addEventListener('click', (e) => {
                if (e.target.id === 'modal-new-product') closeNewProductModal();
            });

            document.getElementById('form-new-product').addEventListener('submit', async (e) => {
                e.preventDefault();
                const form = e.target;
                const statusDiv = document.getElementById('form-status');
                const submitBtn = form.querySelector('button[type="submit"]');

                statusDiv.textContent = '📤 Criando…';
                statusDiv.style.color = '#a1a1aa';
                submitBtn.disabled = true;

                try {
                    const formData = new FormData(form);
                    const badgeVal = formData.get('badge') || null;
                    let badgeColorVal = null;
                    if (badgeVal === 'Novidade') badgeColorVal = 'purple';
                    else if (badgeVal === 'Promoção') badgeColorVal = 'green';
                    else if (badgeVal === 'Limitado') badgeColorVal = 'orange';

                    const sizesVal = formData.get('sizes') ? formData.get('sizes').trim() : '';
                    let variantsVal = null;
                    if (sizesVal) {
                        variantsVal = { sizes: sizesVal.split(',').map(s => s.trim()).filter(Boolean) };
                    }

                    const productData = {
                        name: formData.get('name'),
                        description: formData.get('description'),
                        price: Number(formData.get('price')),
                        stock: Number(formData.get('stock')),
                        category: formData.get('category'),
                        badge: badgeVal,
                        badge_color: badgeColorVal,
                        active: formData.get('active') === 'on',
                        variants: variantsVal,
                    };

                    await createProduct(productData);
                    statusDiv.textContent = '✅ Criado com sucesso!';
                    statusDiv.style.color = '#86efac';
                    setTimeout(() => {
                        closeNewProductModal();
                        loadProducts();
                    }, 1000);
                } catch (err) {
                    statusDiv.textContent = '❌ ' + (err.message || 'Erro ao criar').substring(0, 50);
                    statusDiv.style.color = '#fca5a5';
                } finally {
                    submitBtn.disabled = false;
                }
            });

             // ── Eventos do Financeiro ────────────────────────────────────────────────
             
             // Sub-tabs
             document.querySelectorAll('.sub-nav-tabs .nav-tab').forEach(btn => {
                 btn.addEventListener('click', () => {
                     document.querySelectorAll('.sub-nav-tabs .nav-tab').forEach(b => b.classList.remove('active'));
                     btn.classList.add('active');
                     _activeSubTab = btn.dataset.subtab;
                     
                     document.getElementById('subtab-students').style.display = _activeSubTab === 'students' ? '' : 'none';
                     document.getElementById('subtab-teachers').style.display = _activeSubTab === 'teachers' ? '' : 'none';
                     document.getElementById('subtab-enrollments').style.display = _activeSubTab === 'enrollments' ? '' : 'none';
                     document.getElementById('subtab-lessons').style.display = _activeSubTab === 'lessons' ? '' : 'none';
                     document.getElementById('subtab-tuitions').style.display = _activeSubTab === 'tuitions' ? '' : 'none';
                     document.getElementById('subtab-teacherpayments').style.display = _activeSubTab === 'teacherpayments' ? '' : 'none';
                     document.getElementById('subtab-payments').style.display = _activeSubTab === 'payments' ? '' : 'none';
                     document.getElementById('subtab-expenses').style.display = _activeSubTab === 'expenses' ? '' : 'none';
                     
                     loadFinancialData();
                 });
             });

             // Alunos
             document.getElementById('btn-new-student').addEventListener('click', () => openStudentModal());
             document.querySelectorAll('.btn-cancel-student').forEach(b => b.addEventListener('click', closeStudentModal));
             document.getElementById('student-search-input').addEventListener('input', renderStudents);

             document.getElementById('form-new-student').addEventListener('submit', async (e) => {
                 e.preventDefault();
                 const form = e.target;
                 const id = form.querySelector('[name="id"]').value;
                 const payload = {
                     name: form.querySelector('[name="name"]').value,
                     email: form.querySelector('[name="email"]').value,
                     phone: form.querySelector('[name="phone"]').value,
                     address: form.querySelector('[name="address"]').value,
                     instruments: form.querySelector('[name="instruments"]').value,
                     guardian_name: form.querySelector('[name="guardian_name"]').value,
                     guardian_phone: form.querySelector('[name="guardian_phone"]').value,
                     active: form.querySelector('[name="active"]').checked
                 };

                 try {
                     let res;
                     if (id) {
                         // Edit
                         res = await fetch('/api/admin-financial?resource=students', {
                             method: 'PATCH',
                             headers: { 'Content-Type': 'application/json', 'x-admin-password': _password },
                             body: JSON.stringify({ id, ...payload })
                         });
                     } else {
                         // New
                         res = await fetch('/api/admin-financial?resource=students', {
                             method: 'POST',
                             headers: { 'Content-Type': 'application/json', 'x-admin-password': _password },
                             body: JSON.stringify(payload)
                         });
                     }

                     if (!res.ok) {
                         const data = await res.json();
                         throw new Error(data.error);
                     }
                     showToast('Aluno salvo com sucesso!');
                     closeStudentModal();
                     loadFinancialData();
                 } catch (err) {
                     showToast('Erro ao salvar aluno: ' + err.message);
                 }
             });

             // Professores
             document.getElementById('btn-new-teacher').addEventListener('click', () => openTeacherModal());
             document.querySelectorAll('.btn-cancel-teacher').forEach(b => b.addEventListener('click', closeTeacherModal));
             document.getElementById('teacher-search-input').addEventListener('input', renderTeachers);

             document.getElementById('form-new-teacher').addEventListener('submit', async (e) => {
                 e.preventDefault();
                 const form = e.target;
                 const id = form.querySelector('[name="id"]').value;

                 // Coletar dias da semana selecionados
                 const selectedDays = [];
                 form.querySelectorAll('[name="days_of_week"]:checked').forEach(cb => {
                     selectedDays.push(cb.value);
                 });

                 const payload = {
                     name: form.querySelector('[name="name"]').value,
                     phone: form.querySelector('[name="phone"]').value,
                     specialty: form.querySelector('[name="specialty"]').value,
                     rate_per_class: form.querySelector('[name="rate_per_class"]').value || 0,
                     days_of_week: selectedDays
                 };

                 try {
                     let res;
                     if (id) {
                         // Edit
                         res = await fetch('/api/admin-financial?resource=teachers', {
                             method: 'PATCH',
                             headers: { 'Content-Type': 'application/json', 'x-admin-password': _password },
                             body: JSON.stringify({ id, ...payload })
                         });
                     } else {
                         // New
                         res = await fetch('/api/admin-financial?resource=teachers', {
                             method: 'POST',
                             headers: { 'Content-Type': 'application/json', 'x-admin-password': _password },
                             body: JSON.stringify(payload)
                         });
                     }

                     if (!res.ok) {
                         const data = await res.json();
                         throw new Error(data.error);
                     }
                     showToast('Professor salvo com sucesso!');
                     closeTeacherModal();
                     loadTeachers();
                 } catch (err) {
                     showToast('Erro ao salvar professor: ' + err.message);
                 }
             });

             // Vínculos (enrollments)
             document.getElementById('btn-new-enrollment').addEventListener('click', () => openEnrollmentModal());
             document.querySelectorAll('.btn-cancel-enrollment').forEach(b => b.addEventListener('click', closeEnrollmentModal));
             document.getElementById('enrollment-status-filter').addEventListener('change', loadEnrollments);

              // billing_type toggle for enrollment modal
              document.querySelector('#form-new-enrollment [name=\"billing_type\"]')?.addEventListener('change', updateEnrollmentBillingTypeFields);
            // ── Agenda Mensal ───────────────────────────────────────────
            document.getElementById('agenda-prev-month').addEventListener('click', function() {
                _agendaMonthOffset--;
                loadMonthAgenda();
            });
            document.getElementById('agenda-next-month').addEventListener('click', function() {
                _agendaMonthOffset++;
                loadMonthAgenda();
            });
            document.getElementById('agenda-today-btn').addEventListener('click', function() {
                _agendaMonthOffset = 0;
                loadMonthAgenda();
            });
            document.getElementById('agenda-day-modal-close').addEventListener('click', closeAgendaDayModal);
            document.getElementById('agenda-day-modal').addEventListener('click', function(e) {
                if (e.target === this) closeAgendaDayModal();
            });

            // ---- Eventos: Aulas ----
            var bnl = document.getElementById('btn-new-lesson');
            if(bnl) bnl.addEventListener('click',function(){ openLessonModal(); });
            document.querySelectorAll('.btn-cancel-lesson').forEach(function(b){b.addEventListener('click',closeLessonModal);});
            document.querySelectorAll('.btn-cancel-attendance').forEach(function(b){b.addEventListener('click',closeAttendanceModal);});
            var ldf = document.getElementById('lesson-date-from'); if(ldf) ldf.addEventListener('change',loadLessons);
            var ldt = document.getElementById('lesson-date-to'); if(ldt) ldt.addEventListener('change',loadLessons);
            var lsf = document.getElementById('lesson-status-filter'); if(lsf) lsf.addEventListener('change',loadLessons);
            document.getElementById('form-new-lesson').addEventListener('submit', async function(e){
                e.preventDefault();
                var f=e.target; var se=document.getElementById('form-lesson-status'); se.textContent='Salvando...';
                var id = f.querySelector('[name="id"]').value;
                var p = {
                    enrollment_id: f.querySelector('[name="enrollment_id"]').value,
                    date: f.querySelector('[name="date"]').value,
                    start_time: f.querySelector('[name="start_time"]').value,
                    duration_minutes: parseInt(f.querySelector('[name="duration_minutes"]').value,10)||60,
                    lesson_type: f.querySelector('[name="lesson_type"]').value||'regular',
                    notes: f.querySelector('[name="notes"]').value.trim()||null
                };
                if(id) p.id=id;
                try{
                    var m=id?'PATCH':'POST';
                    var r=await fetch('/api/admin-financial?resource=lessons',{method:m,headers:{'Content-Type':'application/json','x-admin-password':_password},body:JSON.stringify(p)});
                    var d=await r.json();
                    if(!r.ok){
                        if(r.status===409) throw new Error('Professor j\u00e1 tem aula neste hor\u00e1rio.');
                        throw new Error(d.error||'Erro');
                    }
                    showToast(id?'Aula atualizada!':'Aula criada!'); closeLessonModal(); loadLessons();
                }catch(err){ se.textContent='Erro: '+err.message; se.style.color='#fca5a5'; setTimeout(function(){se.textContent='';se.style.color='';},4000); }
            });
            document.getElementById('form-attendance').addEventListener('submit', async function(e){
                e.preventDefault();
                var f=e.target;
                var p={
                    lesson_id: f.querySelector('[name="lesson_id"]').value,
                    student_id: f.querySelector('[name="student_id"]').value,
                    status: f.querySelector('[name="status"]').value,
                    late_minutes: parseInt(f.querySelector('[name="late_minutes"]').value,10)||0,
                    notes: f.querySelector('[name="notes"]').value.trim()||null
                };
                try{
                    var r=await fetch('/api/admin-financial?resource=attendance',{method:'POST',headers:{'Content-Type':'application/json','x-admin-password':_password},body:JSON.stringify(p)});
                    if(!r.ok){ var d=await r.json(); throw new Error(d.error||'Erro'); }
                    showToast('Presen\u00e7a registrada!'); closeAttendanceModal(); loadLessons();
                }catch(err){ showToast('Erro: '+err.message); }
            });

document.getElementById('form-new-enrollment').addEventListener('submit', async (e) => {
                 e.preventDefault();
                 const form = e.target;
                 const id = form.querySelector('[name="id"]').value;
                 const payload = {
                     student_id: form.querySelector('[name="student_id"]').value,
                     teacher_id: form.querySelector('[name="teacher_id"]').value || null,
                     instrument: form.querySelector('[name="instrument"]').value || null,
                     day_of_week: form.querySelector('[name="day_of_week"]').value || null,
                     class_time: form.querySelector('[name="class_time"]').value || null,
                     duration_minutes: form.querySelector('[name="duration_minutes"]').value,
                     classes_per_week: form.querySelector('[name="classes_per_week"]').value,
                     monthly_fee: form.querySelector('[name="monthly_fee"]').value,
                    billing_type: form.querySelector('[name=\"billing_type\"]').value || 'monthly',
                    total_amount: form.querySelector('[name=\"total_amount\"]').value || null,
                    installments: form.querySelector('[name=\"installments\"]').value || 1,
                     status: form.querySelector('[name="status"]').value,
                     notes: form.querySelector('[name="notes"]').value
                 };

                 try {
                     let res;
                     if (id) {
                         res = await fetch('/api/admin-financial?resource=enrollments', {
                             method: 'PATCH',
                             headers: { 'Content-Type': 'application/json', 'x-admin-password': _password },
                             body: JSON.stringify({ id, ...payload })
                         });
                     } else {
                         res = await fetch('/api/admin-financial?resource=enrollments', {
                             method: 'POST',
                             headers: { 'Content-Type': 'application/json', 'x-admin-password': _password },
                             body: JSON.stringify(payload)
                         });
                     }
                     if (!res.ok) throw new Error((await res.json()).error);
                     showToast('Vínculo salvo com sucesso!');
                     closeEnrollmentModal();
                     loadEnrollments();
                 } catch (err) {
                     showToast('Erro ao salvar vínculo: ' + err.message);
                 }
             });

             // Pagamentos a Professores
             document.getElementById('btn-new-teacherpayment').addEventListener('click', async () => {
                 await populateTeacherPaymentSelect();
                 const form = document.getElementById('form-new-teacherpayment');
                 form.reset();
                 const now = new Date();
                 form.querySelector('[name="reference_month"]').value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
                 document.getElementById('modal-new-teacherpayment').style.display = 'flex';
             });
             document.querySelectorAll('.btn-cancel-teacherpayment').forEach(b => b.addEventListener('click', () => {
                 document.getElementById('modal-new-teacherpayment').style.display = 'none';
             }));
             document.getElementById('teacherpayment-teacher-filter').addEventListener('change', loadFinancialData);
             document.getElementById('teacherpayment-paid-filter').addEventListener('change', loadFinancialData);

             document.getElementById('form-new-teacherpayment').addEventListener('submit', async (e) => {
                 e.preventDefault();
                 const form = e.target;
                 const referenceMonthRaw = form.querySelector('[name="reference_month"]').value;
                 const payload = {
                     teacher_id: form.querySelector('[name="teacher_id"]').value,
                     reference_month: referenceMonthRaw ? `${referenceMonthRaw}-01` : null,
                     amount: form.querySelector('[name="amount"]').value,
                     paid: form.querySelector('[name="paid"]').checked,
                     notes: form.querySelector('[name="notes"]').value
                 };
                 try {
                     const res = await fetch('/api/admin-financial?resource=teacher_payments', {
                         method: 'POST',
                         headers: { 'Content-Type': 'application/json', 'x-admin-password': _password },
                         body: JSON.stringify(payload)
                     });
                     if (!res.ok) throw new Error((await res.json()).error);
                     showToast('Pagamento a professor registrado!');
                     document.getElementById('modal-new-teacherpayment').style.display = 'none';
                     loadFinancialData();
                 } catch (err) {
                     showToast('Erro ao registrar: ' + err.message);
                 }
             });

             // Mensalidades
             document.getElementById('btn-generate-monthly-billing').addEventListener('click', async () => {
                 if(!confirm('Deseja gerar as mensalidades deste mês para todas as matrículas ativas? (Matrículas já faturadas no mês serão ignoradas)')) return;
                 try {
                     const btn = document.getElementById('btn-generate-monthly-billing');
                     btn.textContent = 'Gerando...';
                     btn.disabled = true;
                     const res = await fetch('/api/admin-financial?resource=generate_monthly_billing', {
                         method: 'POST',
                         headers: { 'x-admin-password': _password, 'Content-Type': 'application/json' },
                         body: JSON.stringify({})
                     });
                     const data = await res.json();
                     if (!res.ok) throw new Error(data.error);
                     showToast(`Mensalidades geradas com sucesso! (${data.tuitions_generated} novas)`, 'success');
                     loadTuitions();
                 } catch (err) {
                     showToast('Erro ao gerar: ' + err.message);
                 } finally {
                     const btn = document.getElementById('btn-generate-monthly-billing');
                     btn.textContent = '⚡ Fechamento do Mês';
                     btn.disabled = false;
                 }
             });

             document.getElementById('btn-new-tuition').addEventListener('click', async () => {
                 await populateStudentSelects();
                 
                 // Data padrão = primeiro dia do próximo mês
                 const now = new Date();
                 const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
                 const dateStr = nextMonth.toISOString().split('T')[0];
                 
                 const form = document.getElementById('form-new-tuition');
                 form.reset();
                 form.querySelector('[name="due_date"]').value = dateStr;
                 form.querySelector('[name="amount"]').value = "250.00";
                 form.querySelector('[name="reference_month"]').value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

                 await populateTuitionEnrollmentSelect(form.querySelector('[name="student_id"]').value);

                 document.getElementById('modal-new-tuition').style.display = 'flex';
             });
             document.querySelectorAll('.btn-cancel-tuition').forEach(b => b.addEventListener('click', () => {
                 document.getElementById('modal-new-tuition').style.display = 'none';
             }));
             document.getElementById('tuition-status-filter').addEventListener('change', loadFinancialData);
             document.getElementById('tuition-teacher-filter').addEventListener('change', renderTuitions);

             document.querySelector('#form-new-tuition [name="student_id"]').addEventListener('change', (e) => {
                 populateTuitionEnrollmentSelect(e.target.value);
             });
             document.querySelector('#form-new-tuition [name="enrollment_id"]').addEventListener('change', (e) => {
                 const opt = e.target.selectedOptions[0];
                 if (opt && opt.dataset.monthlyFee !== undefined) {
                     document.querySelector('#form-new-tuition [name="amount"]').value = opt.dataset.monthlyFee;
                 }
             });

             document.getElementById('form-new-tuition').addEventListener('submit', async (e) => {
                 e.preventDefault();
                 const form = e.target;
                 const referenceMonthRaw = form.querySelector('[name="reference_month"]').value; // 'YYYY-MM'
                 const payload = {
                     student_id: form.querySelector('[name="student_id"]').value,
                     amount: form.querySelector('[name="amount"]').value,
                     due_date: form.querySelector('[name="due_date"]').value,
                     discount_amount: form.querySelector('[name="discount_amount"]').value,
                     discount_reason: form.querySelector('[name="discount_reason"]').value,
                     notes: form.querySelector('[name="notes"]').value,
                      billing_type: form.querySelector('[name=\"billing_type\"]').value || null,
                      installment_number: form.querySelector('[name=\"installment_number\"]').value || null,
                     enrollment_id: form.querySelector('[name="enrollment_id"]').value || null,
                     reference_month: referenceMonthRaw ? `${referenceMonthRaw}-01` : null
                 };

                 try {
                     const res = await fetch('/api/admin-financial?resource=tuitions', {
                         method: 'POST',
                         headers: { 'Content-Type': 'application/json', 'x-admin-password': _password },
                         body: JSON.stringify(payload)
                     });
                     if (!res.ok) {
                         const data = await res.json();
                         throw new Error(data.error);
                     }
                     showToast('Mensalidade gerada!');
                     document.getElementById('modal-new-tuition').style.display = 'none';
                     loadFinancialData();
                 } catch (err) {
                     showToast('Erro ao criar: ' + err.message);
                 }
             });

             // Pagar mensalidade
             document.querySelectorAll('.btn-cancel-pay-tuition').forEach(b => b.addEventListener('click', () => {
                 document.getElementById('modal-pay-tuition').style.display = 'none';
             }));
             document.getElementById('form-pay-tuition').addEventListener('submit', async (e) => {
                 e.preventDefault();
                 const form = e.target;
                 const id = form.querySelector('[name="tuition_id"]').value;
                 const payment_method = form.querySelector('[name="payment_method"]').value;
                 const paid_at = new Date(form.querySelector('[name="paid_at"]').value).toISOString();

                 try {
                     const res = await fetch('/api/admin-financial?resource=tuitions', {
                         method: 'PATCH',
                         headers: { 'Content-Type': 'application/json', 'x-admin-password': _password },
                         body: JSON.stringify({ id, status: 'paid', payment_method, paid_at })
                     });
                     if (!res.ok) {
                         const data = await res.json();
                         throw new Error(data.error);
                     }
                     showToast('Pagamento registrado!');
                     document.getElementById('modal-pay-tuition').style.display = 'none';
                     loadFinancialData();
                 } catch (err) {
                     showToast('Erro ao pagar: ' + err.message);
                 }
             });

             // Receitas avulsas
             document.getElementById('btn-new-payment').addEventListener('click', async () => {
                 await populateStudentSelects();
                 const form = document.getElementById('form-new-payment');
                 form.reset();
                 
                 const now = new Date();
                 now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
                 form.querySelector('[name="paid_at"]').value = now.toISOString().slice(0, 16);

                 document.getElementById('modal-new-payment').style.display = 'flex';
             });
             document.querySelectorAll('.btn-cancel-payment').forEach(b => b.addEventListener('click', () => {
                 document.getElementById('modal-new-payment').style.display = 'none';
             }));
             document.getElementById('payment-category-filter').addEventListener('change', loadFinancialData);
             document.getElementById('btn-export-payments-csv').addEventListener('click', exportPaymentsCsv);

             document.getElementById('form-new-payment').addEventListener('submit', async (e) => {
                 e.preventDefault();
                 const form = e.target;
                 const payload = {
                     student_id: form.querySelector('[name="student_id"]').value || null,
                     description: form.querySelector('[name="description"]').value,
                     amount: form.querySelector('[name="amount"]').value,
                     category: form.querySelector('[name="category"]').value,
                     payment_method: form.querySelector('[name="payment_method"]').value,
                     paid_at: form.querySelector('[name="paid_at"]').value ? new Date(form.querySelector('[name="paid_at"]').value).toISOString() : null
                 };

                 try {
                     const res = await fetch('/api/admin-financial?resource=payments', {
                         method: 'POST',
                         headers: { 'Content-Type': 'application/json', 'x-admin-password': _password },
                         body: JSON.stringify(payload)
                     });
                     if (!res.ok) {
                         const data = await res.json();
                         throw new Error(data.error);
                     }
                     showToast('Receita registrada!');
                     document.getElementById('modal-new-payment').style.display = 'none';
                     loadFinancialData();
                 } catch (err) {
                     showToast('Erro: ' + err.message);
                 }
             });

             // Custos & despesas
             const expensePaidBox = document.getElementById('expense-paid-checkbox');
             const expensePaidDateContainer = document.getElementById('expense-paid-date-container');
             expensePaidBox.addEventListener('change', () => {
                 expensePaidDateContainer.style.display = expensePaidBox.checked ? '' : 'none';
                 if (expensePaidBox.checked) {
                     const now = new Date();
                     now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
                     document.querySelector('#form-new-expense [name="paid_at"]').value = now.toISOString().slice(0, 16);
                 }
             });

             document.getElementById('btn-new-expense-inline')?.addEventListener('click', function() {
                  document.getElementById('btn-new-expense')?.click();
              });
              document.getElementById('btn-new-investment-inline')?.addEventListener('click', function() {
                  document.getElementById('btn-new-investment')?.click();
              });
              document.getElementById('btn-new-expense-inline')?.addEventListener('click', function() {
                  document.getElementById('btn-new-expense')?.click();
              });
              document.getElementById('btn-new-investment-inline')?.addEventListener('click', function() {
                  document.getElementById('btn-new-investment')?.click();
              });
              document.getElementById('btn-new-expense').addEventListener('click', () => {
                 const form = document.getElementById('form-new-expense');
                 form.reset();
                 expensePaidDateContainer.style.display = 'none';
                 
                 const today = new Date().toISOString().split('T')[0];
                 form.querySelector('[name="due_date"]').value = today;

                 document.getElementById('modal-new-expense').style.display = 'flex';
             });
             document.querySelectorAll('.btn-cancel-expense').forEach(b => b.addEventListener('click', () => {
                 document.getElementById('modal-new-expense').style.display = 'none';
             }));

             document.getElementById('form-new-expense').addEventListener('submit', async (e) => {
                 e.preventDefault();
                 const form = e.target;
                 const paid = form.querySelector('[name="paid"]').checked;
                 const payload = {
                     description: form.querySelector('[name="description"]').value,
                     amount: form.querySelector('[name="amount"]').value,
                     category: form.querySelector('[name="category"]').value,
                     due_date: form.querySelector('[name="due_date"]').value,
                     paid,
                     paid_at: paid && form.querySelector('[name="paid_at"]').value ? new Date(form.querySelector('[name="paid_at"]').value).toISOString() : null
                 };

                 try {
                     const res = await fetch('/api/admin-financial?resource=expenses', {
                         method: 'POST',
                         headers: { 'Content-Type': 'application/json', 'x-admin-password': _password },
                         body: JSON.stringify(payload)
                     });
                     if (!res.ok) {
                         const data = await res.json();
                         throw new Error(data.error);
                     }
                     showToast('Custo fixo registrado!');
                     document.getElementById('modal-new-expense').style.display = 'none';
                     loadFinancialData();
                 } catch (err) {
                     showToast('Erro: ' + err.message);
                 }
             });

             // Investimentos
             document.getElementById('btn-new-investment').addEventListener('click', () => {
                 const form = document.getElementById('form-new-investment');
                 form.reset();
                 const today = new Date().toISOString().split('T')[0];
                 form.querySelector('[name="purchased_at"]').value = today;

                 document.getElementById('modal-new-investment').style.display = 'flex';
             });
             document.querySelectorAll('.btn-cancel-investment').forEach(b => b.addEventListener('click', () => {
                 document.getElementById('modal-new-investment').style.display = 'none';
             }));

             document.getElementById('form-new-investment').addEventListener('submit', async (e) => {
                 e.preventDefault();
                 const form = e.target;
                 const payload = {
                     description: form.querySelector('[name="description"]').value,
                     amount: form.querySelector('[name="amount"]').value,
                     category: form.querySelector('[name="category"]').value,
                     purchased_at: form.querySelector('[name="purchased_at"]').value,
                     notes: form.querySelector('[name="notes"]').value
                 };

                 try {
                     const res = await fetch('/api/admin-financial?resource=investments', {
                         method: 'POST',
                         headers: { 'Content-Type': 'application/json', 'x-admin-password': _password },
                         body: JSON.stringify(payload)
                     });
                     if (!res.ok) {
                         const data = await res.json();
                         throw new Error(data.error);
                     }
                     showToast('Investimento registrado!');
                     document.getElementById('modal-new-investment').style.display = 'none';
                     loadFinancialData();
                 } catch (err) {
                     showToast('Erro: ' + err.message);
                 }
             });

             // Fechar modais ao clicar fora
             ['modal-new-student', 'modal-new-teacher', 'modal-new-tuition', 'modal-pay-tuition', 'modal-new-payment', 'modal-new-expense', 'modal-new-investment'].forEach(id => {
                 document.getElementById(id).addEventListener('click', (e) => {
                     if (e.target.id === id) {
                         document.getElementById(id).style.display = 'none';
                     }
                 });
             });

             document.getElementById('login-submit').addEventListener('click', () =>
                loadPanel(document.getElementById('admin-password-input').value));
            document.getElementById('admin-password-input').addEventListener('keydown', e =>
                { if (e.key==='Enter') document.getElementById('login-submit').click(); });
            document.getElementById('refresh-btn').addEventListener('click', async () => {
                if (!_password) return;
                const { orders } = await fetchOrders(_password);
                _allOrders = orders;
                renderKpis(_allOrders);
                applyFiltersAndRender();
                _countdown = REFRESH_INTERVAL;
                showToast('Pedidos atualizados.');
            });
            document.getElementById('export-csv-btn').addEventListener('click', exportCsv);
            document.getElementById('logout-btn').addEventListener('click', () => {
                clearInterval(_timer);
                sessionStorage.removeItem(STORAGE_KEY);
                _passwordCache.value = null;
                location.reload();
            });
            searchInput.addEventListener('input', applyFiltersAndRender);
            statusFilter.addEventListener('change', applyFiltersAndRender);

            const saved = sessionStorage.getItem(STORAGE_KEY);
            if (saved) loadPanel(saved);
        