import * as $ from 'jquery';

var ALREADY_OPEN = false;

export class Popup {
    msg: string = "";
    callback: Function;
    div: any;
    options: any = {
        buttons: [
            {
                name: "Ok",
                class: "btn btn-success pull-right",
                callback: null,
                return: true,
                close: true
            },
            {
                name: "Cancel",
                class: "btn btn-danger pull-left",
                callback: null,
                return: false,
                close: true
            }
        ],
        size: "s",
        header: "Popup",
        backgroundColor: "#222",
        textColor: "white",

    }

    constructor(msg = "", options = {}, callback = null) {
        this.msg = msg;
        this.options = Object.assign({}, this.options, options)
        this.callback = callback;
    }

    open() {
        let class_ = "";

        switch (this.options.size) {
            case "s" || "S": class_ = "popup-sm"
                break;
            case "m" || "M": class_ = "popup-md"
                break;
            case "l" || "L": class_ = "popup-lg"
                break;
        }

        if (!ALREADY_OPEN) {
            let div = $("<div>", { id: "popup_div_inner", name: 'popupInner', class: "popup fadeIn2 " + class_ });
            let div2 = $("<div>", { id: "backdrop_popup", name: 'popupBackdrop', class: "fadeIn1 backdrop_popup" });
            let card = $("<div>", { id: "card_popup", name: 'card_popup', class: "card", style: "z-index: 1400;" });
            let header = $("<div>", { id: "card_header", name: 'card_header', class: "card-header", html: "<span>" + this.options.header + "</span>", style: "background-color: " + this.options.backgroundColor + "; color: " + this.options.textColor + ";" });
            let body = $("<div>", { id: "card_body", name: 'card_body', class: "card-block", html: '<div class="col-sm-12"><span>' + this.msg + '</span></div>' });
            let footer = $("<div>", { id: "card_footer", name: 'card_footer', class: "card-footer", style: "background-color: " + this.options.backgroundColor + "; color: " + this.options.textColor + ";" });
            this.options.buttons.forEach((button => {
                var button_ = $("<button>", { id: "button" + button["name"], type: "button", name: 'button' + button["name"], class: button["class"], html: button["name"] });
                button_.click(() => {
                    if (button["callback"]) {
                        if (typeof button["return"] !== 'undefined') {
                            button["callback"](button["return"]);
                        } else {
                            button["callback"](button["name"] + " Clicked");
                        }
                    } else if (this.callback) {
                        if (typeof button["return"] !== 'undefined') {
                            this.callback(button["return"]);
                        } else {
                            this.callback(button["name"] + " Clicked");
                        }
                    }
                    if (button["close"]) {
                        this.close();
                    }
                });
                footer.append(button_);
            }));
            card.append(header);
            card.append(body);
            card.append(footer);
            div.append(div2);
            div.append(card);
            $("#popup_div").append(div);
            ALREADY_OPEN = true;
        }
    }

    close() {
        ALREADY_OPEN = false;
        $("#popup_div_inner").removeClass("fadeIn2");
        $("#backdrop_popup").removeClass("fadeIn1");
        $("#popup_div_inner").addClass("fadeOut2");
        $("#backdrop_popup").addClass("fadeOut1");
        setTimeout(() => $("#popup_div").html(""), 550);
    }
}

export default Popup;
