// 主类
class LarkCodegg {
    // 创建编辑器
    constructor(id, cfg) {
        // 实例化一个对象
        var codegg = new Codegg("editor", {
            // colors: {
            //     borderColor: "#cccccc",
            //     toolbarItemColor: "#d81e06",
            //     toolbarItemBackgroudColorHover: "#ffffff",
            //     toolbarBackgroundColor: "#ebebeb",
            //     toolbarSpliteColor: "#dddddd",
            // },
            // toolbar: [["h1", "h2", "h3", "p", "div"], ["b", "i", "s"], ["table", "ol", "ul"], ["link", "image", "audio", "video"], ["view"]]
            toolbar: [
                [
                    { name: "step", html: "@" }
                ]
            ]
        });
        codegg.bind("step",function(){
            codegg.insertContent("@()");
        });
        return codegg;
    }
}