// console.log
var log = function() {
    console.log.apply(console, arguments)
}

// 元素选择器
var e = function(selector) {
    return document.querySelector(selector)
}

//  在元素末尾、结束前插入HTML
var appendHtml = function(element, html) {
    element.insertAdjacentHTML('beforeend', html)
}

// bindEvent() 绑定事件
var bindEvent = function(element, eventName, callback) {
    element.addEventListener(eventName, callback)
}

// toggleClass() class开关(判断是否拥有class,有就remove,没有就add)
var toggleClass = function(element, className) {
    if (element.classList.contains(className)) {
        element.classList.remove(className)
    } else {
        element.classList.add(className)
    }
}

//给所有拥有这个 class 的元素绑定事件
var bindAll = function(selector, eventName, callback) {
    var elements = document.querySelectorAll(selector)
    for(var i = 0; i < elements.length; i++) {
        var e = elements[i]
        bindEvent(e, eventName, callback)
    }
}

//函数可以查找 element 的子元素
var find = function(element, selector) {
    return element.querySelector(selector)
}

// 删除所有 class
var removeClassAll = function(className, element) {
    var selector = '.' + className
    if (element) {
        var elements = element.querySelectorAll(selector)
    } else {
        var elements = document.querySelectorAll(selector)
    }
    for (var i = 0; i < elements.length; i++) {
        var e = elements[i]
        e.classList.remove(className)
    }
}

//ajax函数
var ajax = function(options) {
    var opt = {
        method: options.method || 'GET',
        path: options.path || '',
        headers: options.headers || 'application/json',
        data: options.data || null,
        reseponseCallback: options.reseponseCallback || '',
    }
    var r = new XMLHttpRequest()
    r.open(opt.method, opt.path, true)
    r.setRequestHeader('Content-Type', opt.headers)
    r.onreadystatechange = function() {
        if (r.readyState == 4) {
            opt.reseponseCallback(r)
        }
    }
    r.send(opt.data)
}

// 格式化时间 载入时间对象 否则为当前时间
var timeFormat = function(date) {
    if (date == undefined) {
        date = new Date
    }
    var y = date.getFullYear()
    var m = date.getMonth() + 1
    var d = date.getDate()
    var h = date.getHours()
    var mi = date.getMinutes()
    var s = date.getSeconds()
    if (String(m).length === 1) {
        m = '0' + m
    }
    if (String(d).length === 1) {
        d = '0' + d
    }
    if (String(h).length === 1) {
        h = '0' + h
    }
    if (String(mi).length === 1) {
        mi = '0' + mi
    }
    if (String(s).length === 1) {
        s = '0' + s
    }
    return `${y}-${m}-${d} ${h}:${mi}:${s}`
}

// 改造为只适用于当前项目了
// 添加隐藏的浮动表头（接收一个或多个表格 DOM 对象参数）
// 表格滚动到页面顶部时显示，全部被卷起时隐藏
var tableScroll = function() {
    // 若已添加过，先删除
    var existingHideHead = $('._table-head-hide')
    existingHideHead.remove()

    if (arguments.length < 1) {
        return false
    }
    var list = []
    for (var i = 0; i < arguments.length; i++) {
        var table = arguments[i]
        if (typeof jQuery != 'undefined' && table instanceof jQuery) {
            var $table = table
        } else {
            var $table = $(table)
        }
        // 整个 table 的高度
        var tableHeight = $table.height()
        // 原表头
        var head = $table.find('tr')[0]
        // 原表头的高度
        var headHeight = $(head).height()
        var headThHtml = head.innerHTML
        // 创建一个一模一样的新表头
        var hideHtml = `<tr class="_table-head-hide">${headThHtml}</tr>`
        // 添加表头到表格
        $('.div-table').append(hideHtml)
        var $headHide = $('.div-table').find('._table-head-hide')
        // 隐藏创建的新表头
        $headHide.hide()
        // 把原表头的 class 添加到隐藏的新表头(如过有的话)
        if ($table.find('tr')[0].classList.value != '') {
                $headHide[0].classList.add($table.find('tr')[0].classList)
        }
        // 设定新表头的位置
        $headHide.css('position', 'absolute')
        $headHide.css('top', '30px')
        $headHide.css('border-collapse', 'collapse')
        // 取出有用的数据
        list.push({
            pos: 0,
            $headHide: $headHide,
            $table: $table,
            // 存储原表头用于获取宽度
            head: head,
        })
    }
    // 页面滚动事件
    $('.div-table').off('scroll').scroll(function() {
        var scrollTop = $(this).scrollTop()
        // console.log('scrollTop',scrollTop);
        // 遍历多个表格参数
        for (var i = 0; i < list.length; i++) {
            var item = list[i]
            var table_head_hide = item.$table.find('._table-head-hide')
            // 设置浮动表头的 data
            var dataShow = table_head_hide.data('show') || false
            // 判断页面滚动是否在当前表格范围
            if (scrollTop > item.pos) {
                // 如果页面在表格范围，且浮动表头当前没有显示，则显示浮动表头，并设置相关参数
                if (dataShow == false) {
                    item.$headHide.show()
                    // +1 是因为最左最右两个单元格的边框算了两次
                    item.$headHide.width($(item.head).width() + 1)
                    item.$headHide.data('show', true)
                    table_head_hide.data('show', true)
                    item.$headHide.find('th').each(function() {
                        // 实时获取原表投对应列的宽度
                        // +1 是因为边框 box-shadow 不是 border-box
                        $(this).width($(item.head).find("th").eq($(this).index()).width())
                    })
                }
                if ($(this).scrollLeft() >= 0) {
                    var left = $(head).offset().left -20
                    item.$headHide.css('left', left)
                }
            } else {
                // 如果页面滚到到当前表格以外，且浮动表头是显示状态。则隐藏浮动表头
                if (item.$headHide.data('show') == true) {
                    item.$headHide.hide()
                    item.$headHide.data('show', false)
                }
            }
        }
    })
}
