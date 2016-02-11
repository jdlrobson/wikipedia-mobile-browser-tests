( function ( M ) {
	var LanguageOverlay = M.require( 'mobile.languages.structured/LanguageOverlay' ),
		apiLanguages = [
			{
				lang: 'ar',
				url: 'https://ar.wikipedia.org/wiki/%D8%A8%D8%A7%D8%B1%D8%A7%D9%83_%D8%A3%D9%88%D8%A8%D8%A7%D9%85%D8%A7',
				title: 'باراك أوباما',
				langname: 'العربية'
			}, {
				lang: 'be',
				url: 'https://be.wikipedia.org/wiki/%D0%91%D0%B0%D1%80%D0%B0%D0%BA_%D0%90%D0%B1%D0%B0%D0%BC%D0%B0',
				title: 'Барак Абама',
				langname: 'беларуская'
			}, {
				lang: 'be-x-old',
				url: 'https://be-x-old.wikipedia.org/wiki/%D0%91%D0%B0%D1%80%D0%B0%D0%BA_%D0%90%D0%B1%D0%B0%D0%BC%D0%B0',
				title: 'Барак Абама',
				langname: 'беларуская (тарашкевіца)'
			}, {
				lang: 'ko',
				url: 'https://ko.wikipedia.org/wiki/%EB%B2%84%EB%9D%BD_%EC%98%A4%EB%B0%94%EB%A7%88',
				title: '버락 오바마',
				langname: '한국어'
			}, {
				lang: 'ru',
				url: 'https://ru.wikipedia.org/wiki/%D0%9E%D0%B1%D0%B0%D0%BC%D0%B0,_%D0%91%D0%B0%D1%80%D0%B0%D0%BA',
				title: 'Обама, Барак',
				langname: 'русский'
			}, {
				lang: 'uz',
				url: 'https://uz.wikipedia.org/wiki/Barak_Obama',
				title: 'Barak Obama',
				langname: 'oʻzbekcha/ўзбекча'
			}, {
				lang: 'zh',
				url: 'https://zh.wikipedia.org/wiki/%E8%B4%9D%E6%8B%89%E5%85%8B%C2%B7%E5%A5%A5%E5%B7%B4%E9%A9%AC',
				title: '贝拉克·奥巴马',
				langname: '中文'
			}, {
				lang: 'zh-min-nan',
				url: 'https://zh-min-nan.wikipedia.org/wiki/Barack_Obama',
				title: 'Barack Obama',
				langname: 'Bân-lâm-gú'
			}, {
				lang: 'zh-yue',
				url: 'https://zh-yue.wikipedia.org/wiki/%E5%A5%A7%E5%B7%B4%E9%A6%AC',
				title: '奧巴馬',
				langname: '粵語'
			}, {
				lang: 'zu',
				url: 'https://zu.wikipedia.org/wiki/Barack_Obama',
				title: 'Barack Obama',
				langname: 'isiZulu'
			}
		],
		deviceLanguage = 'en-us',
		frequentlyUsedLanguages = {
			'zh-min-nan': 1,
			zh: 2,
			en: 10,
			ko: 1
		};

	QUnit.module( 'MobileFrontend: Structured LanguageOverlay', {
		setup: function () {
			if ( mw.eventLog ) {
				this.sandbox.stub( mw.eventLog.Schema.prototype, 'log' );
			}

			this.sandbox.stub( mw.storage, 'get' ).withArgs( 'langMap' )
				.returns( JSON.stringify( frequentlyUsedLanguages ) );

			this.languageOverlay = new LanguageOverlay( {
				currentLanguage: mw.config.get( 'wgContentLanguage' ),
				languages: apiLanguages,
				variants: [],
				deviceLanguage: deviceLanguage
			} );
		}
	} );

	QUnit.test( 'test language overlay', 3, function ( assert ) {
		assert.equal(
			this.languageOverlay.$( '.site-link-list.preferred-languages li' ).length,
			3,
			'There are 3 preferred languages.'
		);

		assert.equal(
			this.languageOverlay.$( '.site-link-list.all-languages .has-variants' ).length,
			1,
			'One language has variants.'
		);

		assert.equal(
			this.languageOverlay.$( '.site-link-list.all-languages .variants li' ).length,
			1,
			'One language is a variant.'
		);
	} );

	QUnit.test( 'test language overlay search', 3, function ( assert ) {
		this.languageOverlay.filterLanguages( 'zh' );
		assert.equal(
			this.languageOverlay.$( '.site-link-list li:not(.hidden)' ).length,
			3,
			'Three languages match "zh". And only those languages are visible.'
		);

		this.languageOverlay.filterLanguages( '' );
		assert.equal(
			this.languageOverlay.$( '.site-link-list li:not(.hidden)' ).length,
			10,
			'The search filter has been cleared. All 10 languages (including variants) are visible.'
		);

		this.languageOverlay.filterLanguages( 'ўз' );
		assert.equal(
			this.languageOverlay.$( '.site-link-list li:not(.hidden)' ).length,
			1,
			'One language match "ўз". And only that language is visible.'
		);
	} );
} )( mw.mobileFrontend );
