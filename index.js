/**
 * @Date:   2018-04-27T15:29:00+08:00
 * @Filename: index.js
 * @Last modified time: 2018-07-27T09:50:39+08:00
 */


// url
var urlObj = {
    // 获取二维码的 url
    getQrcode: {
        tb: 'http://local.workics.cn:3000/mock/51/tb/qrcode',
        _1688: 'http://local.workics.cn:3000/mock/51/1688/qrcode',
        jd: 'http://local.workics.cn:3000/mock/51/jd/qrcode',
    },
    // 退出登扫码录
    logout: {
        tb: 'http://local.workics.cn:3000/mock/51/tb/logout',
        _1688: 'http://local.workics.cn:3000/mock/51/1688/logout',
        jd: 'http://local.workics.cn:3000/mock/51/jd/logout',
    },
    // 获取需要展示的订单表格的数据
    showList: {
        tb:'http://local.workics.cn:3000/mock/51/tb/showList',
        _1688: 'http://local.workics.cn:3000/mock/51/1688/showList',
        jd: 'http://local.workics.cn:3000/mock/51/jd/showList',
    },
    // 下载(导出)订单数据
    downloadList: {
        tb: '/service/download',
        _1688: '/service/download',
        jd: '/service/download',
    },
    // 判断是否已经扫码
    isLogin: {
        tb: 'http://local.workics.cn:3000/mock/51/tb/isLogin',
        _1688: 'http://local.workics.cn:3000/mock/51/1688/isLogin',
        jd: 'http://local.workics.cn:3000/mock/51/jd/isLogin',
    },
    // 获取数据爬取进度
    getRate: {
        tb: 'http://local.workics.cn:3000/mock/51/tb/getRate',
        _1688: 'http://local.workics.cn:3000/mock/51/1688/getRate',
        jd: 'http://local.workics.cn:3000/mock/51/jd/getRate',
    },
}

// 监听 hash
var bindHash = function() {
    window.onhashchange = function() {
        // 退出
        e('.button-logout').click()
        showContent(window.location.hash)
    }
}

var showContent = function(hash) {
    var h = hash[0]=='#' ? hash.slice(1) : hash
    var className = '.ul-nav>li>.' + h
    var item = document.querySelector(className)
    loadContent(item)
}

var loadContent = function(item) {
    removeClassAll('active')
    item.classList.add('active')
    // 加载二维码
    getQrcode()
    // 改文案
    var container = e('.explain-container')
    var tb = find(container, '.tb-explain')
    var _1688 = find(container, '._1688-explain')
    var jd = find(container, '.jd-explain')
    if (item.classList.contains('tb')) {
        tb.classList.remove('none')
        _1688.classList.add('none')
        jd.classList.add('none')
    } else if (item.classList.contains('_1688')) {
        tb.classList.add('none')
        _1688.classList.remove('none')
        jd.classList.add('none')
    } else if (item.classList.contains('jd')) {
        tb.classList.add('none')
        _1688.classList.add('none')
        jd.classList.remove('none')
    }
}

// 导航的路由控制
var route = function() {
    var currentHash = window.location.hash
    var defaultHash = $('.ul-nav').find('li a').eq(0).attr('href')
    // 如果当前存在 hash 且 不是默认的 hash
    if (currentHash && currentHash != defaultHash) {
        showContent(currentHash)
    } else {
        showContent(defaultHash)
        window.history.replaceState(null, "", defaultHash)
    }
}

// 点击刷新(获取二维码)
var bindRefreshQrcode = function() {
    var container = e('.explain-container')
    bindEvent(container, 'click', function(event) {
        if (event.target.classList.contains('img-refresh')) {
            getQrcode()
        }
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
    var hash = window.location.hash.slice(1)
    var options = {
        method: 'GET',
        path: urlObj.getQrcode[hash],
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
var polling = function(millisecond=2000) {
    timer2 = setInterval(function() {
        isLogin()
    }, millisecond)
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
        var hash = window.location.hash.slice(1)
        var options = {
            method: 'GET',
            path: urlObj.logout[hash],
            reseponseCallback: resCallback,
        }
        ajax(options)
    })
}

// 在对象中创建用于展示的相应的 key 、value
var createTdShow = function(obj, key, num) {
    var showKey = key + 'show'
    if (obj[key] != undefined) {
        var sliceValue = obj[key].slice(0, num)
        if (sliceValue != obj[key]) {
            obj[showKey] = sliceValue + '...'
        } else {
            obj[showKey] = sliceValue
        }
    }
}

// 创建表头
var createTableHead = function(list) {
    var keys = Object.keys(list[0])
    var trHead = ''
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i]
        // "商品真实单价" 增加说明
        if (key == '商品真实单价') {
            var t = `
            <th class="th-商品真实单价"><span class="${key}"><img title="商品真实单价=（商品总价-运费-商品优惠-店铺优惠）/商品数量" class="img-explain" src=./img/说明.svg>${key}</span></th>
            `
        } else {
            var t = `
            <th><span class="${key}">${key}</span></th>
            `
        }
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
        createTdShow(l, '商品名称', 10)
        createTdShow(l, '商品链接', 20)
        createTdShow(l, '店铺链接', 20)
        createTdShow(l, '规格属性1', 10)
        createTdShow(l, '规格属性2', 10)
        createTdShow(l, '买家旺旺', 10)
        createTdShow(l, '支付宝交易号', 10)
        createTdShow(l, '物流公司', 6)
        createTdShow(l, '买家留言', 10)
        createTdShow(l, '收货地址', 10)
        createTdShow(l, '优惠描述', 10)
        createTdShow(l, '公司链接', 20)
        // 生成 html
        var tr = ''
        var longKeyArr = ['商品名称', '规格属性1', '规格属性2', '买家旺旺', '支付宝交易号', '物流公司', '买家留言', '店铺链接', '收货地址', '优惠描述']
        var nowrapKeyArr = ['商品价格', '商品数量', '商品优惠（C店）', '店铺优惠（天猫）', '商品真实单价', '运费', '商品总价', '订单总价', '实付款']
        var linkKeyArr = ['商品链接', '公司链接']
        for (var j = 0; j < keys.length; j++) {
            var key = keys[j]
            var value = l[key]
            if (key.slice(-4) == 'show') {
                continue
            } else if (longKeyArr.includes(key)) {
                // 太长 需要 hover 效果的
                var k = key + 'show'
                var t = `
                <td title="${value}">
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
            } else if (linkKeyArr.includes(key)) {
                // 链接
                var linkKey = key + 'show'
                var t = `
                <td>
                    <a target="_blank" href=${value || ''} title=${value || ''}> ${l[linkKey] || ''} </a>
                </td>
                `
                tr += t
            } else if (nowrapKeyArr.includes(key)) {
                // 不换行的
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

// 点击查询
var bindSearch = function() {
    var search = e('.button-search')
    bindEvent(search, 'click', function() {
        pollingRate()
    })
}

// 轮询进度
var pollingRate = function(time=1000) {
    getRate()
    rate_timer_1 = setInterval(function() {
        getRate()
    }, time)
}

// 获取进度
var getRate = function() {
    var resCallback = function(r) {
        var rate = JSON.parse(r.response).rate
        if (rate == 100) {
            // 数据爬取完成
            if (rate_timer_1) {
                window.clearInterval(rate_timer_1)
            }
            loadList()
        } else {
            // 展示进度信息
            e('.div-table').classList.remove('none')
            var table = e('.table-list')
            table.querySelector('tbody').innerHTML = `<div class="progress-bar">拼命加载中...<span class="rate">${rate}</span><span class="percent">%</span></div>`
        }
    }
    var hash = window.location.hash.slice(1)
    var options = {
        method: 'GET',
        path: urlObj.getRate[hash],
        reseponseCallback: resCallback,
    }
    ajax(options)
}

// 请求并数据并展示列表
var loadList = function(pageNum = 1) {
    var table = e('.table-list')
    // 添加 loding ,禁用导出,隐藏说明（第一次加载时，页面会卡死，造成看似无法加载 loding 的现象）
    table.querySelector('tbody').innerHTML = '<div class="loading"></div>'
    // 获取时间参数
    var timeOptions = getOptions()
    var pageSize = e('#pg-seId').value
    var hash = window.location.hash.slice(1)
    var baseurl = urlObj.showList[hash]
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
            var sum = e('.div-sum')
            if (list.length == 0) {
                // 查询无结果提示
                loadError('无订单记录，请重新选择周期')
                sum.querySelector('span').innerText = 0
            } else {
                // 生成并加载列表
                showList(list)
                // 显示数目
                sum.querySelector('span').innerText = res.total || '-'
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
        var timeOptions = getOptions()
        var startTime = timeOptions.startTime
        var endTime = timeOptions.endTime
        var querystring = `?startTime=${startTime}&endTime=${endTime}`
        var hash = window.location.hash.slice(1)
        var options = {
            method: 'GET',
            path: urlObj.downloadList[hash] + querystring,
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
        // 显示时间容器，隐藏说明
        e('.div-date-container').classList.remove('none')
        e('.initial-explain').classList.add('none')
        var div_flatpickr = e('.div-flatpickr')
        var div_date = e('.div-date')
        if (target.dataset.day == 'all') {
            // 是否点击全部
            div_date.innerHTML = '全部'
            // 启用查询按钮
            e('.button-search').classList.remove('disabled')
            // 请求数据
            // pollingRate()
        } else if (target.classList.contains('flatpickr-select')) {
            // 是否自定义
            div_flatpickr.classList.remove('hidden')
            div_date.innerHTML = `
                <span class="span-date-start"></span>
                <span>至</span>
                <span class="span-date-end"></span>
            `
            // 禁用查询按钮
            e('.button-search').classList.add('disabled')
        } else {
            div_date.innerHTML = `
                <span class="span-date-start"></span>
                <span>至</span>
                <span class="span-date-end"></span>
            `
            div_flatpickr.classList.add('hidden')
            div_date.classList.remove('none')
            // 计算开始时间和截至时间
            var day = target.dataset.day
            e('.span-date-start').innerText = getSeveralDays(day).startTime
            e('.span-date-end').innerText = getSeveralDays(day).endTime
            // 非自定义时，立即加载列表
            // pollingRate()
            // 启用查询按钮
            e('.button-search').classList.remove('disabled')
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
                // pollingRate()
                // loadList()
                // 启用查询按钮
                e('.button-search').classList.remove('disabled')
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
                // pollingRate()
                // loadList()
                // 启用查询按钮
                e('.button-search').classList.remove('disabled')
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
            e('.ul-nav').classList.add('none')
        }
    }
    var hash = window.location.hash.slice(1)
    var options = {
        method: 'GET',
        path: urlObj.isLogin[hash],
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
    bindHash()
    bindRefreshQrcode()
    bindLogout()
    bindExport()
    bindScan()
    bindTimeSelect()
    bindTimeLi()
    bindTimer()
    bindMouseleave()
    bindPagination()
    bindSearch()
}

var _main = function() {
    route()
    bindEvents()
    autoRefreshQrcode(90000)
    polling(1500)
}

_main()
