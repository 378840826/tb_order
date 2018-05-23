/**
 * @Date:   2018-04-27T15:29:00+08:00
 * @Filename: index.js
 * @Last modified time: 2018-05-23T11:01:46+08:00
 */


// url
var urlObj = {
    // 获取二维码的 url
    getQrcode: 'http://local.workics.cn:3000/mock/51/qrcode',
    // 退出登扫码录
    logout: 'http://local.workics.cn:3000/mock/51/logout',
    // 获取需要展示的订单表格的数据
    showList: 'http://local.workics.cn:3000/mock/51/showList',
    // 下载(导出)订单数据
    downloadList: '/service/download',
    // 判断是否已经扫码
    isLogin: 'http://local.workics.cn:3000/mock/51/isLogin',
}

// 点击刷新(获取二维码)
var bindLogin = function() {
    var refresh = e('.img-refresh')
    bindEvent(refresh, 'click', function(event) {
        getQrcode()
    })
}

// 获取二维码并展示
var getQrcode = function() {
    var div_qrcode = e('.div-qrcode')
    // 初次加载时才需要 loding
    var img = div_qrcode.querySelector('.img-qrcode')
    if (img == null) {
        div_qrcode.innerHTML = '<div class="loading"></div>'
    }
    var resCallback = function(r) {
        var res = JSON.parse(r.response)
        if (res.status == 0) {
            div_qrcode.innerHTML = `<img class="img-qrcode" src="${res.url}" alt="二维码">`
        } else {
            alert('获取二维码失败')
        }
    }
    var options = {
        method: 'GET',
        path: urlObj.getQrcode,
        reseponseCallback: resCallback,
    }
    ajax(options)
}

// 点击二维码扫描成功
var bindScan = function() {
    var scan = e('.button-scan')
    bindEvent(scan, 'click', isLogin)
}

// 轮询是否已经登录（扫码）
var polling = function(num) {
    timer2 = setInterval(function() {
        isLogin()
    }, num)
}

// 点击退出
var bindLogout = function() {
    var logout = e('.button-logout')
    bindEvent(logout, 'click', function() {
        var resCallback = function(r) {
            var status = JSON.parse(r.response).status
            if (status == 0) {
                // 退出成功
                location.reload(true)
            } else {
                // 退出失败
                alert('网络错误')
            }
        }
        var options = {
            method: 'GET',
            path: urlObj.logout,
            reseponseCallback: resCallback,
        }
        ajax(options)
    })
}

// 创建表头
var createTableHead = function(list) {
    var keys = Object.keys(list[0])
    var trHead = ''
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i]
        var t = `
            <th><span class="${key}">${key}</span></th>
        `
        trHead += t
    }
    var html = `<tr class="table-head">${trHead}</tr>`
    return html
}

// 创建表格
var createTable = function(list) {
    var keys = Object.keys(list[0])
    var html = ''
    var length = list.length
    for (var i = 0; i < length; i++) {
        var l = list[i]
        // 生成用于显示的数据
        l['商品名称show'] = l['商品名称'].length < 10 ? l['商品名称'] : l['商品名称'].slice(0, 8) + '...'
        l['商品链接show'] = l['商品链接'].length < 20 ? l['商品链接'] : l['商品链接'].slice(0, 17) + '...'
        l['店铺链接show'] = l['店铺链接'].length < 20 ? l['店铺链接'] : l['店铺链接'].slice(0, 17) + '...'
        l['规格属性1show'] = l['规格属性1'].length < 10 ? l['规格属性1'] : l['规格属性1'].slice(0, 8) + '...'
        l['规格属性2show'] = l['规格属性2'].length < 10 ? l['规格属性2'] : l['规格属性2'].slice(0, 8) + '...'
        l['买家旺旺show'] = l['买家旺旺'].length < 10 ? l['买家旺旺'] : l['买家旺旺'].slice(0, 8) + '...'
        l['支付宝交易号show'] = l['支付宝交易号'].length < 10 ? l['支付宝交易号'] : l['支付宝交易号'].slice(0, 10) + '...'
        l['物流公司show'] = l['物流公司'].length < 6 ? l['物流公司'] : l['物流公司'].slice(0, 4) + '...'
        l['买家留言show'] = l['买家留言'].length < 10 ? l['买家留言'] : l['买家留言'].slice(0, 8) + '...'
        l['收获地址show'] = l['收获地址'].length < 10 ? l['收获地址'] : l['收获地址'].slice(0, 8) + '...'
        // 生成 html
        var tr = ''
        for (var j = 0; j < keys.length; j++) {
            var key = keys[j]
            var value = l[key]
            if (key.slice(-4) == 'show') {
                continue
            } else if (key == '商品名称' || key == '规格属性1' || key == '规格属性2' || key == '买家旺旺' || key == '支付宝交易号' || key == '物流公司' || key == '买家留言' || key == '店铺链接' || key == '收获地址') {
                // 太长 需要 hover 效果的
                var k = key + 'show'
                // 半角空格替换为全角空格，不然 title 显示错误
                var v = value.replace(/ /g, '　')
                var t = `
                <td title=${v}>
                    ${l[k]}
                </td>
                `
                tr += t
            } else if (key == '商品图片') {
                var t = `
                <td>
                    <img class="img-商品图片" src=${value || ''} alt="商品图片">
                </td>
                `
                tr += t
            } else if (key == '商品链接') {
                var t = `
                <td>
                    <a target="_blank" href=${value || ''} title=${value || ''}>${l['商品链接show'] || ''}</a>
                </td>
                `
                tr += t
            } else if (key == '商品价格' || key == '商品数量' || key == '商品优惠（C店）' || key == '店铺优惠（天猫）' || key == '商品真实单价' || key == '运费' || key == '商品总价' || key == '订单总价' || key == '实付款') {
                var t = `
                <td nowrap>${value || ''}</td>
                `
                tr += t
            } else {
                var t = `
                <td>${value || ''}</td>
                `
                tr += t
            }
        }
        html += '<tr>' + tr + '</tr>'
    }
    return html
}

// 显示错误页
var loadError = function(error = '网络有点问题，请稍后重试') {
    // 隐藏表格容器
    e('.div-table').classList.add('none')
    // 隐藏数量
    e('.div-sum').classList.add('none')
    // 隐藏分页
    e('.pagination').classList.add('none')
    // 显示无结果或网络错的提示
    var div_error = e('.div-error')
    div_error.querySelector('p').innerText = error
    div_error.classList.remove('none')
}

// 生成并展示列表数据
var showList = function(list) {
    // 隐藏错误提示
    e('.div-error').classList.add('none')
    // 显示数量
    e('.div-sum').classList.remove('none')
    // 非导出状态时，启用导出按钮
    var button_export = e('.button-export')
    var loding = button_export.parentNode.querySelector('.mini-loading')
    if (loding == null) {
        e('.button-export').classList.remove('disabled')
    }
    // 创建并显示表格
    var table = e('.table-list')
    var headHtml = createTableHead(list)
    var tableHtml = createTable(list)
    appendHtml(find(table, 'tbody'), headHtml)
    appendHtml(find(table, 'tbody'), tableHtml)
    e('.div-table').classList.remove('none')
    // 添加滚动固定表头
    tableScroll(table)
}

// 动态设置表格容器的高度
var setTableContainerHeight = function() {
    var browserHeight = document.documentElement.clientHeight
    var div_table = e('.div-table')
    var parentNode = div_table.parentNode
    var children = parentNode.children
    var prevAllHeight = 0
    // 获取前面的同级元素的高度
    for (var i = 0; i < children.length; i++) {
        var c = children[i]
        if (c == div_table) {
            break
        } else {
            cHeight = c.offsetHeight
            prevAllHeight += cHeight
        }
    }
    // 获取父元素的前面的同级元素的高度
    var pParentNode = parentNode.parentNode
    var pChildren = pParentNode.children
    for (var i = 0; i < pChildren.length; i++) {
        var pC = pChildren[i]
        if (pC == parentNode) {
            break
        } else {
            pcHeight = pC.offsetHeight
            prevAllHeight += pcHeight
        }
    }
    // -20 -30 是父元素的 margin 和滚动条的高度，-60 是留给分页的空间
    var div_tableHeight = browserHeight - prevAllHeight - 20 - 30 - 60
    div_table.style.height = div_tableHeight + 'px'
}

// 加载分页
var loadPagination = function(res, pageRange=4) {
    // 显示分页
    e('.pagination').classList.remove('none')
    var page_num = res.page_num                      // 当前页
    var total = res.total                            // 总条数
    var page_size = res.page_size                    // 每页条数
    var totalNumPg = Math.ceil(total / page_size)    // 总页数
    // 要显示的 当前/总共
    e('.pg-total').innerText = `${page_num}/${totalNumPg}`
    // 数字，前后 pageRange 个，最多共 pageRange*2 +1 个
    var html = ''
    for (var i = page_num - pageRange; i <= page_num + pageRange; i++) {
        if (i > 0 && i < totalNumPg) {
            if (i == page_num) {
                var htmlNum = `<span class="pg-item pg-item-num active" data-value="${i}">${i}</span>`
            } else {
                var htmlNum = `<span class="pg-item pg-item-num" data-value="${i}">${i}</span>`
            }
            html += htmlNum
        }
    }
    // 页码数字加载到页面
    e('.pg-num').innerHTML = html
    // 上一页/下一页
    var last = e('.last-pg')
    var next = e('.next-pg')
    last.dataset.value = page_num - 1
    next.dataset.value = page_num + 1
    // 当前第一页时禁用上一页，当前最后一页时禁用下一页
    if (page_num == 1) {
        last.classList.add('disabled')
    } else if (page_num == totalNumPg) {
        next.classList.add('disabled')
    } else {
        last.classList.remove('disabled')
        next.classList.remove('disabled')
    }
}

// 分页点击
var bindPagination = function() {
    var pagination = e('.pagination')
    bindEvent(pagination, 'click', function(event) {
        var target = event.target
        if (target.classList.contains('pg-item')) {
            // 点击数字或上/下一页
            var pageNum = target.dataset.value
            loadList(pageNum)
        } else if (target.classList.contains('btn-go')) {
            // 点击 go 跳转
            var pg_total = Number(e('.pg-total').innerText.split('/')[1])
            var pgGo = e('input.pg-go')
            var activeVal = e('.pg-item.active').dataset.value
            var pgGoVal = pgGo.value
            if (pgGoVal == activeVal || pgGoVal == '') {
                // 输入了当前页或空值时，不跳转, 输入框获得焦点
                pgGo.focus()
            } else if (pgGoVal > pg_total) {
                // 超出最大值时候, 跳到最大值
                loadList(pg_total)
            } else {
                loadList(pgGoVal)
            }
        }
    })
}

// 请求并数据并展示列表
var loadList = function(pageNum = 1) {
    var table = e('.table-list')
    // 添加 loding ,禁用导出,隐藏说明（第一次加载时，页面会卡死，造成看似无法加载 loding 的现象）
    table.querySelector('tbody').innerHTML = '<div class="loading"></div>'
    // e('.button-export').classList.add('disabled')
    e('.initial-explain').classList.add('none')
    // 获取时间参数
    var timeOptions = getOptions()
    var pageSize = e('#pg-seId').value
    var baseurl = urlObj.showList
    var url = baseurl + `?pageNum=${pageNum}&pageSize=${pageSize}&startTime=${timeOptions.startTime}&endTime=${timeOptions.endTime}`
    var resCallback = function(request) {
        e('.loading').remove()
        var res = JSON.parse(request.response)
        // 请求是否正常
        if (res.status != 0) {
            // 网络错误提示
            loadError('网络有点问题，请稍后重试')
        } else {
            var list = res.data.list
            // 本地存储
            sessionStorage.ordersList = JSON.stringify(list)
            // 是否有数据
            if (!list) {
                // 查询无结果提示
                loadError('无订单记录，请重新选择周期')
            } else {
                // 生成并加载列表
                showList(list)
                // 显示数目
                var sum = e('.div-sum')
                sum.querySelector('span').innerText = res.data.total || 0
                // 加载分页
                loadPagination(res, 4)
                // 设置表格容器高度
                setTableContainerHeight()
            }
        }
    }
    var options = {
        method: 'GET',
        path: url,
        reseponseCallback: resCallback,
    }
    ajax(options)
}

// 点击导出（下载）
var bindExport = function() {
    var exp = e('.button-export')
    bindEvent(exp, 'click', function(event) {
        var target = event.target
        var button = target.closest('.div-button-export')
        target.classList.add('disabled')
        appendHtml(button, '<div class="mini-loading"></div>')
        var resCallback = function(r) {
            var disp = r.getResponseHeader('Content-Disposition')
            //判断是否为文件
            if (disp && disp.search('attachment') != -1) {
                // 创建一个 form 表单
                var form = `
                    <form id="form-download" method="POST" action="${options.path}">
                `
                appendHtml(e('body'), form)
                //自动提交
                e('#form-download').submit()
                e('#form-download').remove()
            } else {
                alert('导出失败');
            }
            // 启用导出按钮，删除 loding
            target.classList.remove('disabled')
            button.querySelector('.mini-loading').remove()
        }
        var options = {
            method: 'GET',
            path: urlObj.downloadList,
            reseponseCallback: resCallback,
        }
        ajax(options)
    })
}

// 获取查询列表所需的参数
var getOptions = function() {
    var startTime = e('.span-date-start')
    var endTime = e('.span-date-end')
    if (!startTime) {
        var o = {
            startTime: 'all',
            endTime: 'all',
        }
    } else {
        var o = {
            startTime: startTime.innerText,
            endTime: endTime.innerText,
        }
    }
    return o
}

// 点击时间选择
var bindTimeSelect = function() {
    var button_time = e('.button-time')
    bindEvent(button_time, 'click', function(event) {
        var target = event.target
        var ul = target.closest('.button-time').nextElementSibling
        toggleClass(ul, 'none')
    })
}

// 点击时间 li
var bindTimeLi = function() {
    bindAll('.li-time', 'click', function(event) {
        var target = event.target
        e('#id-select-time').innerText = target.innerText
        e('#id-select-time').dataset.day = target.dataset.day
        var ul = target.closest('ul')
        toggleClass(ul, 'none')
        // 显示时间容器
        e('.div-date-container').classList.remove('none')
        var div_flatpickr = e('.div-flatpickr')
        var div_date = e('.div-date')
        if (target.dataset.day == 'all') {
            // 是否点击全部
            div_date.innerHTML = '全部'
            loadList()
        } else if (target.classList.contains('flatpickr-select')) {
            // 是否自定义
            div_flatpickr.classList.remove('hidden')
            div_date.innerHTML = `
                <span class="span-date-start"></span>
                <span>至</span>
                <span class="span-date-end"></span>
            `
        } else {
            div_date.innerHTML = `
                <span class="span-date-start"></span>
                <span>至</span>
                <span class="span-date-end"></span>
            `
            div_flatpickr.classList.add('hidden')
            div_date.classList.remove('none')
            // 计算开始时间和截至时间 （-1 因为包括当天）
            var day = target.dataset.day - 1
            e('.span-date-start').innerText = getSeveralDays(day).startTime
            e('.span-date-end').innerText = getSeveralDays(day).endTime
            // 非自定义时，立即加载列表
            loadList()
        }
    })
}

//鼠标移开下拉框隐藏
var bindMouseleave = function() {
    var drop = e('.drop-down-time')
    bindEvent(drop, 'mouseleave', function(event) {
        event.stopPropagation()
        e('.ul-time').classList.add('none')
    })
}

// 时间选择插件挂载
var bindTimer = function() {
    // 起始日期选择插件
    var f1 = e('#id-date-start').flatpickr({
        enableTime: true,
        dateFormat: "Y-m-d H:i:s",
        enableSeconds: true,
        defaultHour: 0,
        closeOnSelect: false,
        minDate: "1949-10-1",
        maxDate: e('#id-date-end').value || "today",
        time_24hr: true,
        locale: 'zh',
        onClose: function() {
            // 同步到 span
            var value = e('#id-date-start').value
            // 秒为 0 的时候，改为 00
            if (value.slice(-2, -1) == ':') {
                value = value.slice(0, -1) + '0' + value.slice(-1)
            }
            e('.span-date-start').innerText = value
            // 先选择开始时间的前提下，设置截至时间不能早于当前选择的开始时间
            if (e('.span-date-start').innerText != '') {
                f2.config.minDate = timeFormat(new Date(f1.selectedDates))
            }
            // 如果已经选择了截止时间，加载列表
            var endTime = e('#id-date-end').value
            if (endTime) {
                loadList()
            }
        }
    })
    // 截至日期选择插件
    var f2 = e('#id-date-end').flatpickr({
        enableTime: true,
        dateFormat: "Y-m-d H:i:s",
        enableSeconds: true,
        defaultHour: 0,
        closeOnSelect: false,
        minDate: e('#id-date-start').value || "2000-01",
        maxDate: "today",
        time_24hr: true,
        locale: 'zh',
        onClose: function() {
            // 同步到 span
            var value = e('#id-date-end').value
            // 秒为 0 的时候，改为 00
            if (value.slice(-2, -1) == ':') {
                value = value.slice(0, -1) + '0' + value.slice(-1)
            }
            e('.span-date-end').innerText = value
            // 先选择结束时间的前提下，设置开始时间不能晚于截至时间
            if (e('.span-date-end').innerText != '') {
                f1.config.maxDate = timeFormat(new Date(f2.selectedDates))
            }
            // 如果已经选择了开始时间，加载列表
            var startTime = e('#id-date-start').value
            if (startTime) {
                loadList()
            }
        }
    })
}

// 获取 n 天前到现在的时间范围对象(只要年月日)（'最近一天'从当天0点算起）
var getSeveralDays = function(n) {
    var date = new Date()
    var msec = n * 24 * 60 * 60 * 1000
    var nowTimestamp = Date.parse(new Date())
    var startTimestamp = nowTimestamp - msec
    var startTimeObj = new Date(startTimestamp)
    var startTime = timeFormat(startTimeObj)
    var endTime = timeFormat()
    return {
        startTime: startTime,
        endTime: endTime,
    }
}

// 判断是否登录，登录后跳转到订单页（扫描二维码成功）
var isLogin = function() {
    var resCallback = function(r) {
        var status = JSON.parse(r.response).status
        // 已扫描
        if (status == 0) {
            // 删除刷新二维码定时器
            if (typeof timer1 != 'undefined') {
                window.clearInterval(timer1)
            }
            // 删除轮询是否登录定时器
            if (typeof timer2 != 'undefined') {
                window.clearInterval(timer2)
            }
            // 显示已扫描页
            e('.timing').classList.remove('none')
            e('.initial-explain').classList.remove('none')
            e('.home-page').classList.add('none')
        }
    }
    var options = {
        method: 'GET',
        path: urlObj.isLogin,
        reseponseCallback: resCallback,
    }
    ajax(options)
}

// 如果未扫码，自动刷新二维码
var autoRefreshQrcode = function(millisecond=60000) {
    timer1 = setInterval(function() {
        getQrcode()
    }, millisecond)
}

var bindEvents = function() {
    bindLogin()
    bindLogout()
    bindExport()
    bindScan()
    bindTimeSelect()
    bindTimeLi()
    bindTimer()
    bindMouseleave()
    bindPagination()
}

var _main = function() {
    bindEvents()
    getQrcode()
    autoRefreshQrcode(90000)
    polling(1000)
}

_main()
