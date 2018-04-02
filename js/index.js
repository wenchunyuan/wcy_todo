var mySwiper = new Swiper ('.swiper-container', {
    direction: 'vertical',
    loop: true,
    // 如果需要分页器
    pagination: {
        el: '.swiper-pagination',
    }
});
var iscroll = new IScroll('.content', {
    mouseWheel: true,
    scrollbars: true,
    shrinkScrollbars:'scale',    //滚动条缩小
    fadeScrollbars:'true',
    click:'true'
});
//点击新增

var state="project";
$(".add").click(function () {
    $(".mask").show();
    $(".inputarea").transition({y:0},500)
    $(".submit").show();
    $(".updata").hide();
});
$(".cancel").click(function () {
    $(".inputarea").transition({y:"-62vh"},500,function () {
        $(".mask").hide();
    })
});
//提交事件
$(".submit").click(function () {
    var val=$("#text").val();           //获取值
    //判断是否含内容
    if(val===""){
        return;
    }
    $("#text").val("");
    var data=getData();
    //获取毫秒数
    var time=new Date().getTime();
    //增加内容
    data.push({content:val,time,star:false,done:false});
    //更新，保存数据
    saveData(data);
    render();
    //点击提交，收起textarea
    $(".inputarea").transition({y:"-62vh"},500,function () {
        $(".mask").hide();
    })
});
$(".project").click(function () {
    $(this).addClass("active").siblings().removeClass("active");
    state="project";
    render();
});
$(".done").click(function () {
    $(this).addClass("active").siblings().removeClass("active");
    state="done";
    render();
});
$(".updata").click(function () {
    var val=$("#text").val();           //获取值
    //判断是否含内容
    if(val===""){
        return;
    }
    $("#text").val("");
    var data=getData();
    var index=$(this).data("index");
    data[index].content=val;
    saveData(data);
    render();
    //点击提交，收起textarea
    $(".inputarea").transition({y:"-62vh"},500,function () {
        $(".mask").hide();
    })
})


$(".itemlist")
    .on("click",".changestate",function () {
        var index=$(this).parent().attr("id");
        var data=getData();
        data[index].done=true;
        saveData(data);
        render();
    })
    .on("click",".del",function () {
        var index=$(this).parent().attr("id");
        var data=getData();
        data.splice(index,1);     //jiequ
        saveData(data);
        render();
    })
    .on("click","span",function () {
        var index=$(this).parent().attr("id");
        var data=getData();
        data[index].start=!data[index].start;   //qufan
        saveData(data);
        render();
    })
    .on("click","p",function () {
        //通过id知道该数组第几天
        var index=$(this).parent().attr("id");
        var data=getData();
        $(".mask").show();
        $(".inputarea").transition({y:0},500)
        $("#text").val(data[index].content);
        $(".submit").hide();
        $(".updata").show().data("index",index);
        // $(".updata").data("index",index);
        saveData(data);
        render();
    })
//数据提交
//获取数据，保证数据及时更新
function  getData() {
    return localStorage.todo?JSON.parse(localStorage.todo):[];
}
//保存数据
function saveData(data) {
    localStorage.todo=JSON.stringify(data);
}
// 渲染页面
function render() {
    var data=getData();
    var str="";
    // $.each();               //===data.each()
    // 遍历
    data.forEach(function (val,index) {
        // 将val.time作为参数传到paeseTime中
        if(state==="project"&&val.done===false) {
            str += "<li id="+index+"><p>" + val.content + "</p><time>" + paeseTime(val.time) + "</time>" +
                "<span class="+(val.start?"active":"")+">❤</span><div class='changestate'>完成</div></div></li>";
        }else if(state==="done"&&val.done===true){
            str += "<li id="+index+"><p>" + val.content + "</p><time>" + paeseTime(val.time) + "</time>" +
                "<span class="+(val.start?"active":"")+">❤</span><div class='del'>删除</div></div></li>";
        }
    })
    $(".itemlist").html(str);
    iscroll.refresh();
    addTouchEvent();
}
render();
// 将毫秒数处理--分装
function paeseTime(time) {
    var date=new Date();
    date.setTime(time);
    var year=date.getFullYear();
    var month=setZero(date.getMonth()+1);
    var day=setZero(date.getDate());
    var hour=setZero(date.getHours());
    var min=setZero(date.getMinutes());
    var sec=setZero(date.getSeconds());
    return year+"/"+month+"/"+day+"<br>"+hour+":"+min+":"+sec;
}
function setZero(n) {
    // 如果n<0，就返回“0”+n，否则就返回n
    return n<10?"0"+n:n;
}
function addTouchEvent() {
    $(".itemlist>li").each(function (index,ele) {
        let hammerobj=new Hammer(ele);
        let sx,movex;          //sx开始触摸时的位置，movex移动的位置
        let max=window.innerWidth/5;         //===删除按钮的宽度
        let state="start";
        let flag=true;
        hammerobj.on("panstart",function (e) {
            ele.style.transition="none";
            // sx=e.changedTouches[0].clientX;       //窗口左边缘位置
            sx=e.center.x;
        })
        hammerobj.on("panmove",function (e) {
            // let cx=e.changedTouches[0].clientX;
            let cx=e.center.x;
            movex=cx-sx;
            //限制了开始不可以向左滑动
            if(movex>0&&state==="start"){
                flag=false;
                return;
            }
            //限制滑动距离不可以超过max
            if(Math.abs(movex)>max){
                flag=false;
                state=state==="start"?"end":"start";
                //结束状态
                if(state==="end"){
                    ele.style.transform=`translateX(${-max}px)`;
                    // $(ele).css("x",-max);
                }else{
                    ele.style.transform=`translateX(0)`;
                }
                return;
            }
            // 结束
            if(movex<0&&state==="end"){
                flag=false;
                return;
            }
            // 结束状态应该移动的值
            if(state==="end"){
                movex=cx-sx-max;
            }
            flag=true;
            ele.style.transform=`translateX(${movex}px)`;
        })
        // 拖拽结束
        hammerobj.on("panend",function (e) {
            // 假值：结束
            if(!flag){return}
            // 否则：加过度属性
            ele.style.transition="all .5s";
            if(Math.abs(movex)<max/2){
                ele.style.transform="translateX(0)";
                // $(ele).transition({x:0})
                // 状态改变
                state="start";
            }else{
                ele.style.transform=`translateX(${-max}px)`;
                state="end";
            }
        })
    })
}