;(function() {
    var $form_add_task = $('.add-task'),
        $input = $form_add_task.find('input[name=content]'),
        $task_detail = $('.task-detail'),
        $task_detail_mask = $('.task-detail-mask'),
        new_task = {},
        task_list = [],
        current_index,
        $update_form,
        $task_detail_content,
        $task_detail_content_input,
        $task_detail_reset,
        $checkbox,
        $alerter = $('.alerter');
        
        init();

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
            renderList();
        }
        return true;
    })

    // 监听元素删除点击
    function listenTaskDelete() {
        var $delete_task = $('.delete');
        $delete_task.on('click',function() {
            var index = $(this).parent().parent().data('index');
            deleteTask(index);
        });
    }

    // 监听元素细节点击
    function listenTaskDetail() {
        var $detail_task = $('.detail');
        $detail_task.on('click',function() {
            var index = $(this).parent().parent().data('index');
            showTaskDetail(index);
        });
        $('.task-item').on('dblclick', function() {
           $(this).find('.detail').trigger('click');
        });
    }

    // 监听单选框点击事件
    function listenCheckboxComplete() {
        $checkbox = $('.task-item .complete');
        $checkbox.on('click', function() {
            var $this = $(this);
            var index = $this.parent().parent().data('index');
            var item = get(index);

            if (item.complete) {
                updateTask(index, {complete: false});
            } else {
                updateTask(index, {complete: true});
            }
        });
    }

    // 监听任务完成通知 
    function listenMsg() {
        $('.msg button').on('click', function() {
          
            $('.msg').hide();
        })
    }

    function get(index) {
        return store.get('task_list')[index];
    }


    $task_detail_mask.on('click', function() {
        hideTaskDetail();
    })

    // 查看task详情
    function showTaskDetail(index) {
        // 生成详情
        renderTaskDetail(index);
        current_index = index;
        // 显示详情
        $task_detail.show();
        // 显示遮罩
        $task_detail_mask.show();
    }

    // 更新task
    function updateTask(index, data) {
        if(!index || !task_list[index]) {
            return;
        }
        task_list[index] = $.extend({}, task_list[index], data);
        store.set('task_list', task_list);
        renderList();
    }


    function hideTaskDetail(index) {
        $task_detail.hide();
        $task_detail_mask.hide();
    }

    function renderTaskDetail(index) {
        var item = task_list[index];
        var task_detail_html = ejs.render( $("#taskDetail").html(),{ content: item.content, detail: item.desc, time: (item.time || '')});
        // 先清空
        $task_detail.html("");
        // 再插入
        $task_detail.html(task_detail_html);

        $('.datetime').datetimepicker();

        // 选中细节的表单,之后会监听他的提交
        $update_form = $task_detail.find('form');

        // 选中task细节里的标题
        $task_detail_content = $update_form.find('.content');
        // 选中细节标题的输入框,默认隐藏
        $task_detail_content_input = $update_form.find('[name=content]');
        
        // 给细节标题添加双击编辑事件
        $task_detail_content.on('dblclick', function() {
            // 显示标题输入框
            $task_detail_content_input.show();
            // 隐藏标题框
            $task_detail_content.hide();
        });

        // 获取重置按钮
        $task_detail_reset = $update_form.find('.reset');

        // 重置按钮事件
        $task_detail_reset.on('click', function(e) {
            e.preventDefault();
            $update_form.find('[name=desc]').val("");
            $update_form.find('[name=remind_date]').val("");
        })
        
        $update_form.on('submit', function(e) {
            e.preventDefault();
            var data  = {};
            data.content = $(this).find('[name=content]').val();
            data.desc = $(this).find('[name=desc]').val();
            data.time = $(this).find('[name=remind_date]').val();
            updateTask(index, data);
            hideTaskDetail();
        })
    }

    // 增加任务
    function addTask(new_task) {
        // 将新task推入task_list
        task_list.push(new_task);
        // 更新localStorage
        store.set('task_list', task_list);
        return true;
    }

    // 删除任务
    function deleteTask(index) {
        task_list.splice(index, 1);
        store.set('task_list', task_list);
        renderList();
    }

    // 初始化
    function init() {
         task_list = store.get('task_list') || [];
         if ( task_list.length) {
             renderList();
         }
         task_remind_check();
         listenMsg();
    }

    function task_remind_check() {
         var current_timestamp;
         showMsg('lalala');
         var timer = setInterval(function() {
            for(var i = 0; i < task_list.length; i++) {
                var item = get(i);
                if (!item || !item.time || item.informed) {
                    continue;
                }
                var task_timestamp = (new Date(item.time)).getTime();
                current_timestamp = (new Date()).getTime();
                if (current_timestamp - task_timestamp >= 1) {
                    updateTask(i, {informed: true});
                    showMsg(item.content);
                }
            }
         }, 300);
       
    }

    function showMsg(msg) {
        if (!msg) {
            return;
        }
        $('.msg-content').html(msg).parent().show();
        $alerter.get(0).play();
    }

    // 重新渲染所有任务列表
    function renderList() {
        // 获取task_list
        task_list = store.get('task_list') || [];
        // 将任务列表清空
        $('.tasks-list').html("");

        var complete_items = [];

        // 遍历渲染
        for(var i = 0; i < task_list.length; i++) {
            var item = task_list[i];
            // 如果是已经完成的
            if (item && item.complete) {
                // 推入到完成数组,暂时不渲染
                complete_items[i] = item;
            } else {
                if(item.complete === undefined) {
                    item.complete = false;
                }
                var task_html = renderTaskItem(item, i);
                $('.tasks-list').prepend(task_html);
            }
        }

        for(var j = 0; j < complete_items.length; j++) {
            var item = complete_items[j];
            var task_html = renderTaskItem(item, j);
            if (!task_html) {
                continue;
            }
            $(task_html).addClass('completed');
            $('.tasks-list').append(task_html);
        }

        //更新监听元素
        listenTaskDelete();
        listenTaskDetail();
        listenCheckboxComplete();
    }

    function renderTaskItem(data, index) {
         if(!data || !index) return;
         data.index = index;
         var task_html = ejs.render( $("#taskItem").html(), data);
         return $(task_html);
    }


})();