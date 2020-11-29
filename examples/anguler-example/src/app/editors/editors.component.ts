import { Component, OnInit } from '@angular/core';
import { Editor, getEditor, OpenApiDocument } from 'openapi-definition-to-editor';
import openapiSchemaExample from 'openapi-definition-to-editor/src/openapiSchemaExample2.json';

@Component({
    selector: 'app-editors',
    templateUrl: './editors.component.html',
    styleUrls: ['./editors.component.css'],
})
export class EditorsComponent implements OnInit {
    constructor() {}
    editors: Editor[];
    value: any;
    ngOnInit(): void {
        this.editors = ['DeepMappingSettings'].map(tabName => getEditor((openapiSchemaExample as any) as OpenApiDocument, tabName));
        this.value = {
            _id: {
                $oid: '5dd3d88b63391c72839f6411',
            },
            title: 'RaidForum',
            baseUrl: 'https://raidforums.com/',
            credentials: [
                {
                    _id: {
                        $oid: '5de3a574a4bf9b5574c52ea7',
                    },
                    isEnabled: false,
                    isBroken: false,
                    notes: [],
                    username: 'hagelbagel101',
                    password: 'Expq784ya',
                    proxyId: 9,
                    lastUsed: '2017-08-29T05:02:19Z',
                    parallelDegree: 0,
                    sleepBetweenAcquiresSec: 0,
                    isAuthAutofixEnabled: false,
                    userAgent: '',
                    componentDriven: null,
                },
                {
                    isEnabled: true,
                    isBroken: false,
                    isAuthAutofixEnabled: false,
                    notes: [],
                    parallelDegree: 1,
                    sleepBetweenAcquiresSec: 0,
                    username: 'chackis',
                    password: 'NAD9sd!@De1222112',
                    proxyId: 10,
                    _id: {
                        $oid: '5ec23c54fbf36f63d257fe66',
                    },
                },
                {
                    isEnabled: true,
                    isBroken: false,
                    notes: [],
                    isAuthAutofixEnabled: false,
                    parallelDegree: 1,
                    sleepBetweenAcquiresSec: 0,
                    username: 'lebowski98',
                    password: 'NDa9sdq!D1212d1211d212',
                    proxyId: 35,
                    _id: {
                        $oid: '5efb11aa0692b0524dd0235c',
                    },
                },
                {
                    isEnabled: true,
                    notes: [],
                    isBroken: false,
                    isAuthAutofixEnabled: false,
                    parallelDegree: 1,
                    sleepBetweenAcquiresSec: 0,
                    username: 'creepyheebyjeebie',
                    password: 'LAOAsdpqw99dqw',
                    proxyId: 56,
                    _id: {
                        $oid: '5efb11bf0692b0524dd0235e',
                    },
                },
                {
                    isEnabled: true,
                    notes: [],
                    isBroken: false,
                    isAuthAutofixEnabled: false,
                    parallelDegree: 1,
                    sleepBetweenAcquiresSec: 0,
                    username: 'misterfilter',
                    password: 'NDA8sd21d12d12110101',
                    proxyId: 48,
                    _id: {
                        $oid: '5efb11d30692b0524dd02360',
                    },
                },
            ],
            cycleGroup: 'DefaultCycleGroup',
            dataType: 'IndexedData',
            deletedIndicators: [
                {
                    value: 'The specified thread does not exist',
                    shouldExist: true,
                    type: 'Text',
                },
                {
                    value: 'Sorry, but there are currently no threads in this forum with the specified date and time limiting options.',
                    shouldExist: true,
                    type: 'Text',
                },
                {
                    value: '>404 not found<',
                    shouldExist: true,
                    type: 'Text',
                },
                {
                    value: '>your account has either been suspended or you have been banned from accessing this resource.<',
                    shouldExist: true,
                    type: 'Text',
                },
            ],
            enqueueIntervalMin: 0,
            excludedCategoryUrls: [
                'https://raidforums.com/forum-report-staff-anonymously',
                'https://raidforums.com/Forum-Not-Safe-For-Work ',
                'https://raidforums.com/Forum-Anime-Manga',
                'https://raidforums.com/Forum-The-Lounge ',
                'https://raidforums.com/Forum-Random-Discussion',
                'https://raidforums.com/Forum-Achievements',
                'https://raidforums.com/Forum-Serious-Discussion',
                'https://raidforums.com/Forum-Hentai',
                'https://raidforums.com/Forum-Giveaways-Removed-Content',
            ],
            extraCategoryUrls: [],
            indexingMaxInstances: 1,
            isCredentialsBreakable: true,
            isDataOverrideMode: true,
            isDeprecated: false,
            isEnabled: true,
            isFiltered: false,
            isInitialIndexed: false,
            isParsed: true,
            isUsingCredentials: true,
            isUsingFictiveUrl: false,
            mappingMaxInstances: 0,
            notes: [],
            prevBaseUrls: [],
            proxyType: 'LinkedToCredentials',
            requestTimeoutSec: 120,
            selectors: [
                {
                    name: 'alt_category_url',
                    xpath: '',
                },
                {
                    name: 'main_category_url',
                    xpath: "//a[@class='forums__forum-name']|//ul[@class='forums__subforums nav']/li/a",
                },
                {
                    name: 'url_regex',
                    regex: '',
                },
                {
                    name: 'category_next_page',
                    xpath: "//a[@class='pagination_next']",
                },
                {
                    name: 'category_key',
                    regex: 'Forum-([-\\w]+)',
                },
                {
                    name: 'result_link_container',
                    xpath: "//table//tr[contains(@class,'forum')]",
                },
                {
                    name: 'result_link',
                    xpath: './/span[@id]/a',
                },
                {
                    name: 'last_reply_date',
                    xpath: ".//span[contains(@class,'lastpost')]/text()[1]",
                },
                {
                    name: 'reply_count',
                    xpath: './/td/a[@onclick]',
                },
                {
                    name: 'result_next_page',
                    xpath: "//div[@class='pagination talign-mleft']/a[@class='pagination_next']",
                },
                {
                    name: 'topic_key',
                    regex: '[Tt]hread-([^?\\s]+)',
                },
                {
                    name: 'topic_page_num',
                    regex: '\\?page=(\\d+)',
                },
                {
                    name: 'data_container',
                    xpath: "//div[@id='posts']/div[contains(@id,'post_')]",
                },
                {
                    name: 'title',
                    xpath: "//span[@class='thread-info__name rounded']",
                    regex: '',
                },
                {
                    name: 'author',
                    xpath:
                        ".//div[@class='post__user']//a[.//span|./img[@original-title]]/@href|.//div[@class='post__user' and following-sibling::div[contains(text(),'Guest')]]/div/text()|.//div[contains(@class,'post__user')]/a[contains(@href,'User-')]/@href",
                    regex: '((?<=\\/[Uu]ser-).+$|^(?!.*\\/[Uu]ser-).+$)',
                },
                {
                    name: 'author_url',
                    regex: '',
                    xpath: ".//div[@class='post__user']//a[./span|./img[@original-title]]",
                },
                {
                    name: 'date',
                    regex: '(?:.+?M|\\d+.+ago)',
                    xpath: ".//span[@class='post_date']",
                    isDayBeforeMonth: false,
                    _t: 'CrawlerDateSelector',
                },
                {
                    name: 'content',
                    xpath: './/div[contains(@id,"pid")]',
                },
                {
                    name: 'data_url',
                    xpath: './/strong/a',
                },
                {
                    name: 'result_key',
                    regex: '\\?pid=(\\d+)',
                },
                {
                    name: 'images_container',
                    xpath: './/div[contains(@id,"pid")]',
                },
            ],
            severity: 2,
            sleepBetweenRequestsSec: 7,
            softRequestLimit: 0,
            sourceGroups: [1, 7],
            targetSite: '',
            type: 'SiteBaseCrawler',
            userAgent: '',
            webPageEncoding: null,
            tier: 1,
            authenticationRetries: 3,
            version: 24,
            lastModified: 1604925854862,
            proxy: 'LinkedToCredentials',
            hasThreads: true,
            useNewAuth: true,
            loginUrl: 'https://raidforums.com//member.php?action=login',
            authenticationIndicators: [
                {
                    value: 'action=logout',
                    shouldExist: true,
                    type: 'Text',
                },
            ],
            loginActions: [
                {
                    name: 'username',
                    actionType: 'Typing',
                    query: "//input[@name='username']",
                    queryType: 'XPath',
                },
                {
                    name: 'password',
                    actionType: 'Typing',
                    query: "//input[@name='password']",
                    queryType: 'XPath',
                },
                {
                    name: 'submit',
                    actionType: 'Submit',
                    query: "//input[@name='submit']",
                    queryType: 'XPath',
                },
            ],
            captchaSolvers: [
                {
                    indicator: {
                        value: '[name=h-captcha-response]',
                        type: 'Css',
                        shouldExist: true,
                    },
                    settings: {
                        type: 'HCaptcha',
                        _t: 'HCaptchaSettings',
                    },
                    actions: [
                        {
                            name: 'submit',
                            query: "//input[@name='submit' and preceding-sibling::input[@name='securitycaptcha']]",
                            queryType: 'XPath',
                            actionType: 'Submit',
                        },
                    ],
                    isMiddleSession: true,
                },
                {
                    settings: {
                        type: 'HCaptcha',
                        _t: 'HCaptchaSettings',
                    },
                    indicator: {
                        shouldExist: true,
                        type: 'Css',
                        value: '[name=h-captcha-response]',
                    },
                    isMiddleSession: false,
                },
                {
                    settings: {
                        type: 'ReCaptcha',
                        _t: 'ReCaptchaSettings',
                    },
                    indicator: {
                        shouldExist: true,
                        type: 'Css',
                        value: '#g-recaptcha-response',
                    },
                    isMiddleSession: false,
                },
                {
                    settings: {
                        type: 'KeyCaptcha',
                        _t: 'KeyCaptchaSettings',
                    },
                    indicator: {
                        shouldExist: true,
                        type: 'Text',
                        value: 'keycaptcha-root',
                    },
                    isMiddleSession: false,
                },
            ],
            csrfBypassIndicators: [
                {
                    shouldExist: true,
                    type: 'Text',
                    value: '<span data-translate="checking_browser">Checking your browser before accessing</span>',
                },
            ],
            isLoginUnnecessary: false,
            monitorGroups: ['Forums'],
            categoryKeyRegex: 'Forum-([-\\w]+)',
            categoryUrlSelector: {
                name: 'main_category_url',
                query: "//a[@class='forums__forum-name']|//ul[@class='forums__subforums nav']/li/a",
                selectorQueryType: 'Xpath',
                propertyPicker: 'href',
            },
            dataContainerSelector: {
                name: 'data_container',
                query: "//div[@id='posts']/div[contains(@class,'post')]",
                selectorQueryType: 'Xpath',
            },
            dataSelectorsArray: [
                {
                    name: 'url',
                    query: './/strong/a',
                    selectorQueryType: 'Xpath',
                    propertyPicker: 'href',
                    cleaningRegex: '',
                },
                {
                    name: 'body',
                    query: './/div[contains(@id,"pid")]',
                    selectorQueryType: 'Xpath',
                },
                {
                    name: 'title',
                    query: "//span[@class='thread-info__name rounded']",
                    selectorQueryType: 'Xpath',
                },
                {
                    name: 'postedDate',
                    query: ".//span[@class='post_date']",
                    selectorQueryType: 'Xpath',
                    cleaningRegex: '(?:.+?M|\\d+.+ago)',
                    isDayBeforeMonth: false,
                    _t: 'NewCrawlerDateSelector',
                },
                {
                    name: 'userName',
                    query:
                        ".//div[@class='post__user']//a[.//span|./img[@original-title]]/@href|.//div[@class='post__user' and following-sibling::div[contains(text(),'Guest')]]/div/text()|.//div[contains(@class,'post__user')]/a[contains(@href,'User-')]/@href",
                    selectorQueryType: 'Xpath',
                    propertyPicker: 'href',
                    cleaningRegex: '((?<=\\/[Uu]ser-).+$|^(?!.*\\/[Uu]ser-).+$)',
                },
                {
                    name: 'userURL',
                    query: ".//div[@class='post__user']//a[./span|./img[@original-title]]",
                    selectorQueryType: 'Xpath',
                    propertyPicker: 'href',
                },
            ],
            dataValidation: [
                {
                    _t: 'NullOrEmptyValidation',
                    key: 'body',
                },
                {
                    _t: 'NullOrEmptyValidation',
                    key: 'title',
                },
                {
                    _t: 'NullOrEmptyValidation',
                    key: 'userName',
                },
                {
                    _t: 'IllegalCharactersValidation',
                    key: 'body',
                },
                {
                    _t: 'IllegalCharactersValidation',
                    key: 'title',
                },
                {
                    _t: 'NullOrEmptyValidation',
                    key: 'postedDate',
                },
                {
                    _t: 'IllegalCharactersValidation',
                    key: 'postedDate',
                },
                {
                    _t: 'FutureDateValidation',
                    key: 'postedDate',
                },
                {
                    _t: 'IllegalCharactersValidation',
                    key: 'userName',
                },
                {
                    _t: 'NullOrEmptyValidation',
                    key: 'userURL',
                },
                {
                    _t: 'IllegalCharactersValidation',
                    key: 'userURL',
                },
                {
                    _t: 'UrlValidation',
                    key: 'userURL',
                },
                {
                    _t: 'NullOrEmptyValidation',
                    key: 'url',
                },
                {
                    _t: 'IllegalCharactersValidation',
                    key: 'url',
                },
                {
                    _t: 'UrlValidation',
                    key: 'url',
                },
            ],
            processActions: [
                {
                    _t: 'HtmlDecodeProcess',
                    key: 'postedDate',
                },
                {
                    _t: 'HtmlDecodeProcess',
                    key: 'body',
                },
                {
                    _t: 'HtmlDecodeProcess',
                    key: 'title',
                },
                {
                    _t: 'HtmlDecodeProcess',
                    key: 'userName',
                },
                {
                    _t: 'HtmlDecodeProcess',
                    key: 'userURL',
                },
                {
                    _t: 'HtmlDecodeProcess',
                    key: 'categoryName',
                },
                {
                    _t: 'HtmlDecodeProcess',
                    key: 'subCategoryName',
                },
                {
                    _t: 'HtmlDecodeProcess',
                    key: 'url',
                },
                {
                    _t: 'DateParseProcess',
                    dayBeforeMonth: 'false',
                    key: 'postedDate',
                },
                {
                    _t: 'GetAbsoluteUrlProcess',
                    key: 'url',
                },
                {
                    _t: 'RegexProcess',
                    regex: '\\?pid=(\\d+)',
                    key: 'url',
                    destKey: 'resultKey',
                },
                {
                    _t: 'RegexProcess',
                    regex: '[Tt]hread-([^?\\s]+)',
                    key: 'url',
                    destKey: 'topicKey',
                },
                {
                    _t: 'DynamicDataProcess',
                    key: 'dynamicData',
                },
                {
                    _t: 'BodyImagesProcess',
                    key: 'bodyImages',
                    contentKey: 'body',
                },
                {
                    _t: 'ParentUrlContainerProcess',
                    key: 'url',
                    destKey: 'parentURL',
                },
            ],
            subCategoryUrlSelector: {
                name: 'alt_category_url',
                query: '',
                selectorQueryType: 'Xpath',
                propertyPicker: 'href',
            },
            topicChangedSelectors: [
                {
                    name: 'reply_count',
                    query: './/td/a[@onclick]',
                    selectorQueryType: 'Xpath',
                },
                {
                    name: 'last_reply_date',
                    query: ".//span[contains(@class,'lastpost')]/text()[1]",
                    selectorQueryType: 'Xpath',
                },
            ],
            topicKeyRegex: '[Tt]hread-([^?\\s]+)',
            topicPageNumRegex: '\\?page=(\\d+)',
            topicUrlSelector: {
                name: 'result_link',
                query: './/span[@id]/a',
                selectorQueryType: 'Xpath',
                propertyPicker: 'href',
            },
            categoryPageIterator: {
                _t: 'ActionsPageIterator',
                lastPageIndicator: {
                    value: "//a[@class='pagination_next']",
                    type: 'XPath',
                    shouldExist: false,
                },
                actions: [
                    {
                        name: 'nextPage',
                        query: "//a[@class='pagination_next']",
                        queryType: 'XPath',
                        actionType: 'Submit',
                    },
                ],
            },
            topicPageIterator: {
                _t: 'ActionsPageIterator',
                lastPageIndicator: {
                    value: "//div[@class='pagination talign-mleft']/a[@class='pagination_next']",
                    type: 'XPath',
                    shouldExist: false,
                },
                actions: [
                    {
                        name: 'nextPage',
                        query: "//div[@class='pagination talign-mleft']/a[@class='pagination_next']",
                        queryType: 'XPath',
                        actionType: 'Submit',
                    },
                ],
            },
            categoryContainerSelector: {
                query: '.forums__bit tbody > tr',
                selectorQueryType: 'Css',
            },
            topicContainerSelector: {
                name: 'result_link_container',
                query: "//table//tr[contains(@class,'forum')]",
                selectorQueryType: 'Xpath',
            },
            isDynamicCrawler: true,
            runningModes: ['ShallowMapping', 'DeepMapping', 'Mapping', 'Indexing', 'Parsing'],
            deepMappingMaxInstances: 1,
            shallowMappingMaxInstances: 1,
        };
    }
}
