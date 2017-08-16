function StorageImpl() {
    var selectedLanguage = null;

    var languages = [
        {
            title: 'English',
            clientAccessToken: '09604c7f91ce4cd8a4ede55eb5340b9d',
            lang: 'en'
        },
        {
            title: 'Deutsch',
            clientAccessToken: 'df23b1ee7ea345f5bd4a52bb2ec4a3e3',
            lang: 'de'
        },
        {
            title: 'Español',
            clientAccessToken: '430d461ea8e64c09a4459560353a5b1d',
            lang: 'es'
        },
        {
            title: 'Français',
            clientAccessToken: 'd6434b3bf49d4a93a25679782619f39d',
            lang: 'fr'
        },
        {
            title: 'Italiano',
            clientAccessToken: '4319f7aa1765468194d9761432e4db36',
            lang: 'it'
        },
        {
            title: '日本語',
            clientAccessToken: '6cab6813dc8c416f92c3c2e2b4a7bc27',
            lang: 'ja'
        },
        {
            title: '한국의',
            clientAccessToken: 'b0219c024ee848eaa7cfb17dceb9934a',
            lang: 'ko'
        },
        {
            title: 'Português (Portugal)',
            clientAccessToken: '3f71440584844f048bad712daf9e19de',
            lang: 'pt'
        },
        {
            title: 'Português (Brasil)',
            clientAccessToken: '6076377eea9e4291854204795b55eee9',
            lang: 'pt-BR'
        },
        {
            title: 'Русский',
            clientAccessToken: 'adcb900f02594f4186420c082e44173e',
            lang: 'ru'
        },
        {
            title: '中文（简体)',
            clientAccessToken: '2b575c06deb246d2abe4bf769eb3200b',
            lang: 'zh-CN'
        },
        {
            title: '中文（廣東話)',
            clientAccessToken: '00ef32d3e35f43178405c046a16f3843',
            lang: 'zh-HK'
        },
        {
            title: '中文（繁體)',
            clientAccessToken: 'dd7ebc8a02974155aeffec26b21b55cf',
            lang: 'zh-TW'
        }
    ];
    this.languages = languages;
}

StorageImpl.prototype.getLanguages = function getLanguages() {
    return this.languages;
};

StorageImpl.prototype.setSelectedLanguage = function setSelectedLanguage(value) {
    this.selectedLanguage = value;

    try {
        ApiAIPlugin.init(
            {
                clientAccessToken: value.clientAccessToken,
                lang: value.lang
            },
            function () {
                alert("Init success");
            },
            function (error) {
                alert("Init error\n" + error);
            });
    } catch (e) {
        alert(e);
    }
}

StorageImpl.prototype.getSelectedLanguage = function getSelectedLanguage() {
    return this.selectedLanguage;
}

var Storage = (function () {
    var instance;

    function createInstance() {
        var object = new StorageImpl();
        return object;
    }


    return {
        getInstance: function () {
            if (!instance) {
                instance = createInstance();
                languages = instance.getLanguages();
                instance.setSelectedLanguage(languages[0]);
            }
            return instance;
        }
    };
})();
