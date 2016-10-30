;(function() {
    'use strict';
    var $form_add_task = $('.add-task'),
        $input = $form_add_task.find('input[name=content]'),
        new_task = {},
        task_list = [];
    renderInitList();
    $form_add_task.on('submit', function(e) {
        // 禁用默认行为
        e.preventDefault();

        // 获取新task的值
        new_task.content = $input.val();
        
        // 清空输入框
        $input.val('')

        if(!new_task.content) {
            return;
        }
        
        // 如果task值合法,存入task_list
        if(addTask(new_task)) {
            renderNewList();
        }
        return true;
    })

    function addTask(new_task) {
        // 将新task推入task_list
        task_list.push(new_task);
        // 更新localStorage
        store.set('task_list', task_list);
        return true;
    }

    function renderInitList() {
        task_list = store.get('task_list') || [];
        for(var i = 0; i < task_list.length; i++) {
            var task_html = ejs.render( $("#module").html(),{content : task_list[i].content});
            $('.tasks-list').append(task_html);
        }
    }

    function renderNewList() {
        var task_html = ejs.render( $("#module").html(),{content : new_task.content});
        $('.tasks-list').append(task_html);
    }

})();