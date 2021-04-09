'use strict';

const _set = require('lodash/set');
const _get = require('lodash/get');
const _merge = require('lodash/merge');
const _clamp = require('lodash/clamp');

const functionKeys = {
    SET_LED: 'set-pixel',
    GET_LED: 'get-pixel',
    RESET: 'reset',
    PRESET_IMAGE: 'pre-image',
    SET_CUSTOM_IMAGE: 'custom-image',
};

Entry.Microbit2 = new (class Microbit2 {
    constructor() {
        this.id = '22.3';
        this.url = 'http://microbit.org/ko/';
        this.imageName = 'microbit2.png';
        this.title = {
            en: 'Microbit v2',
            ko: '마이크로빗 v2',
        };
        this.name = 'microbit2';
        this.communicationType = 'manual';
        this.blockMenuBlocks = [
            'microbit2_set_led',
            'microbit2_get_led',
            'microbit2_show_preset_image',
            'microbit2_show_custom_image',
            'microbit2_show_full_brightness_custom_image',
        ];
        this.commandStatus = {};
        this.commandValue = {};
    }

    setZero() {
        // 엔트리 정지시 하드웨어 초기화 로직
        this.requestCommand(functionKeys.RESET);
        this.commandStatus = {};
        this.commandValue = {};
    }

    // will not use in this module
    requestCommand(type, payload) {
        Entry.hw.sendQueue = {
            type,
            payload,
        };
        Entry.hw.update();
    }

    /**
     * command 요청 후 데이터 송수신이 끝날 때까지 대기한다.
     * @param type
     * @param payload
     */
    requestCommandWithResponse(entityId, type, payload) {
        const codeId = this.generateCodeId(entityId, type, payload);
        if (!this.commandStatus[codeId]) {
            // 첫 진입시 무조건 AsyncError
            Entry.hw.sendQueue = {
                type,
                payload,
            };
            this.commandStatus[codeId] = 'pending';
            Entry.hw.sendQueue.codeId = codeId;
            Entry.hw.update();
            throw new Entry.Utils.AsyncError();
        } else if (this.commandStatus[codeId] === 'pending' && !this.commandValue[codeId]) {
            // 두 번째 이상의 진입시도이며 작업이 아직 끝나지 않은 경우
            throw new Entry.Utils.AsyncError();
        } else if (this.commandStatus[codeId] === 'completed') {
            // 두 번째 이상의 진입시도이며 pending 도 아닌 경우
            // 블록 func 로직에서 다음 데이터를 처리한다.
            delete this.commandStatus[codeId];
        }
    }

    generateCodeId(entityId, type, payload) {
        return `${entityId}-${type}-${payload}`;
    }

    afterReceive(portData) {
        if (portData.payload) {
            let codeId = portData.payload.recentlyWaitDone;
            let value = portData.payload.result;
            if (codeId) {
                if (codeId.indexOf('reset') > -1) {
                    this.commandStatus = {};
                    this.commandValue = {};
                    return;
                }
                this.commandStatus[codeId] = 'completed';
                this.commandValue[codeId] = value || 'DONE';
            }
        }

        if (!Entry.engine.isState('run')) {
            this.commandStatus = {};
        }
    }
    // 언어 적용
    setLanguage() {
        return {
            ko: {
                template: {
                    microbit2_set_led: 'LED X:%1 Y:%2 밝기 %3 로 세팅 %4',
                    microbit2_get_led: 'LED X:%1 Y:%2 값',
                    microbit2_show_preset_image: '%1 모양 보여주기',
                    microbit2_show_custom_image: '밝기를 포함한 LED %1 로 출력하기 %2',
                    microbit2_show_full_brightness_custom_image: 'LED 가장 밝게 %1 로 출력하기 %2',
                },
                Blocks: {
                    microbit_2_HEART: '하트',
                    microbit_2_HEART_SMALL: '작은 하트',
                    microbit_2_HAPPY: '행복',
                    microbit_2_SMILE: '웃음',
                    microbit_2_SAD: '슬픔',
                    microbit_2_CONFUSED: '혼란',
                    microbit_2_ANGRY: '화남',
                    microbit_2_ASLEEP: '졸림',
                    microbit_2_SURPRISED: '놀람',
                    microbit_2_SILLY: '멍청함',
                    microbit_2_FABULOUS: '환상적인',
                    microbit_2_MEH: '별로',
                    microbit_2_YES: '예스',
                    microbit_2_NO: '노',
                    microbit_2_CLOCK1: '1시',
                    microbit_2_CLOCK2: '2시',
                    microbit_2_CLOCK3: '3시',
                    microbit_2_CLOCK4: '4시',
                    microbit_2_CLOCK5: '5시',
                    microbit_2_CLOCK6: '6시',
                    microbit_2_CLOCK7: '7시',
                    microbit_2_CLOCK8: '8시',
                    microbit_2_CLOCK9: '9시',
                    microbit_2_CLOCK10: '10시',
                    microbit_2_CLOCK11: '11시',
                    microbit_2_CLOCK12: '12시',
                    microbit_2_ARROW_N: '북쪽',
                    microbit_2_ARROW_NE: '북동쪽',
                    microbit_2_ARROW_E: '동쪽',
                    microbit_2_ARROW_SE: '동남쪽',
                    microbit_2_ARROW_S: '남쪽',
                    microbit_2_ARROW_SW: '남서쪽',
                    microbit_2_ARROW_W: '서쪽',
                    microbit_2_ARROW_NW: '북서쪽',
                    microbit_2_TRIANGLE: '삼각형',
                    microbit_2_TRIANGLE_LEFT: '왼쪽 삼각형',
                    microbit_2_CHESSBOARD: '체스판',
                    microbit_2_DIAMOND: '다이아몬드',
                    microbit_2_DIAMOND_SMALL: '작은 다이아몬드',
                    microbit_2_SQUARE: '사각형',
                    microbit_2_SQUARE_SMALL: '작은 사각형',
                    microbit_2_RABBIT: '토끼',
                    microbit_2_COW: '소',
                    microbit_2_MUSIC_CROTCHET: '4분음표',
                    microbit_2_MUSIC_QUAVER: '8분음표',
                    microbit_2_MUSIC_QUAVERS: '8분음표 2개',
                    microbit_2_PITCHFORK: '포크',
                    microbit_2_XMAS: '크리스마스',
                    microbit_2_PACMAN: '팩맨',
                    microbit_2_TARGET: '목표',
                    microbit_2_TSHIRT: '티셔츠',
                    microbit_2_ROLLERSKATE: '롤러스케이트',
                    microbit_2_DUCK: '오리',
                    microbit_2_HOUSE: '말',
                    microbit_2_TORTOISE: '거북이',
                    microbit_2_BUTTERFLY: '나비',
                    microbit_2_STICKFIGURE: '스틱맨',
                    microbit_2_GHOST: '유령',
                    microbit_2_SWORD: '칼',
                    microbit_2_GIRAFFE: '기린',
                    microbit_2_SKULL: '해골',
                    microbit_2_UMBRELLA: '우산',
                    microbit_2_SNAKE: '뱀',
                },
            },
            en: {
                template: {
                    microbit2_set_led: 'SET LED at X:%1 Y:%2 as brightness %3 %4',
                    microbit2_get_led: 'Get LED X:%1 Y:%2 brightness',
                    microbit2_show_preset_image: 'Show %1 shape',
                    microbit2_show_custom_image: 'Show %1 shape with brightness %2',
                    microbit2_show_full_brightness_custom_image:
                        'Show %1 shape with full brightness %2',
                },
                Blocks: {
                    microbit_2_HEART: 'Heart',
                    microbit_2_HEART_SMALL: 'Small Heart',
                    microbit_2_HAPPY: 'Happy',
                    microbit_2_SMILE: 'Smile',
                    microbit_2_SAD: 'Sad',
                    microbit_2_CONFUSED: 'Confused',
                    microbit_2_ANGRY: 'Angry',
                    microbit_2_ASLEEP: 'Asleep',
                    microbit_2_SURPRISED: 'Surprised',
                    microbit_2_SILLY: 'Silly',
                    microbit_2_FABULOUS: 'Fabulous',
                    microbit_2_MEH: 'Meh',
                    microbit_2_YES: 'Yes',
                    microbit_2_NO: 'No',
                    microbit_2_CLOCK1: "1'o clock",
                    microbit_2_CLOCK2: "2'o clock",
                    microbit_2_CLOCK3: "3'o clock",
                    microbit_2_CLOCK4: "4'o clock",
                    microbit_2_CLOCK5: "5'o clock",
                    microbit_2_CLOCK6: "6'o clock",
                    microbit_2_CLOCK7: "7'o clock",
                    microbit_2_CLOCK8: "8'o clock",
                    microbit_2_CLOCK9: "9'o clock",
                    microbit_2_CLOCK10: "10'o clock",
                    microbit_2_CLOCK11: "11'o clock",
                    microbit_2_CLOCK12: "12'o clock",
                    microbit_2_ARROW_N: 'North',
                    microbit_2_ARROW_NE: 'North East',
                    microbit_2_ARROW_E: 'East',
                    microbit_2_ARROW_SE: 'South East',
                    microbit_2_ARROW_S: 'South',
                    microbit_2_ARROW_SW: 'South West',
                    microbit_2_ARROW_W: 'West',
                    microbit_2_ARROW_NW: 'North West',
                    microbit_2_TRIANGLE: 'Triangle',
                    microbit_2_TRIANGLE_LEFT: 'Left Triangle',
                    microbit_2_CHESSBOARD: 'Chess Board',
                    microbit_2_DIAMOND: 'Diamond',
                    microbit_2_DIAMOND_SMALL: 'Small Diamond',
                    microbit_2_SQUARE: 'Square',
                    microbit_2_SQUARE_SMALL: 'Small Square',
                    microbit_2_RABBIT: 'Rabbit',
                    microbit_2_COW: 'Cow',
                    microbit_2_MUSIC_CROTCHET: 'Crotchet',
                    microbit_2_MUSIC_QUAVER: 'Quaver',
                    microbit_2_MUSIC_QUAVERS: 'Quavers',
                    microbit_2_PITCHFORK: 'Pitchfork',
                    microbit_2_XMAS: 'X-mas',
                    microbit_2_PACMAN: 'Pacman',
                    microbit_2_TARGET: 'Target',
                    microbit_2_TSHIRT: 'T-shirt',
                    microbit_2_ROLLERSKATE: 'Roller Skate',
                    microbit_2_DUCK: 'Duck',
                    microbit_2_HOUSE: 'Horse',
                    microbit_2_TORTOISE: 'Tortoise',
                    microbit_2_BUTTERFLY: 'Butterfly',
                    microbit_2_STICKFIGURE: 'Stickman',
                    microbit_2_GHOST: 'Ghost',
                    microbit_2_SWORD: 'Sword',
                    microbit_2_GIRAFFE: 'Giraffe',
                    microbit_2_SKULL: 'Skull',
                    microbit_2_UMBRELLA: 'Umbrella',
                    microbit_2_SNAKE: 'Snake',
                },
            },
        };
    }
    getBlocks = function() {
        return {
            microbit2_set_led: {
                color: EntryStatic.colorSet.block.default.HARDWARE,
                outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Block',
                        accept: 'string',
                        defaultType: 'number',
                    },
                    {
                        type: 'Block',
                        accept: 'string',
                        defaultType: 'number',
                    },
                    {
                        type: 'Block',
                        accept: 'string',
                        defaultType: 'number',
                    },
                    {
                        type: 'Indicator',
                        img: 'block_icon/hardware_icon.svg',
                        size: 12,
                    },
                ],
                events: {},
                class: 'microbit2Led',
                isNotFor: ['microbit2'],
                def: {
                    params: [
                        {
                            type: 'text',
                            params: ['0'],
                        },
                        {
                            type: 'text',
                            params: ['0'],
                        },
                        {
                            type: 'text',
                            params: ['0'],
                        },
                    ],
                    type: 'microbit2_set_led',
                },
                paramsKeyMap: {
                    X: 0,
                    Y: 1,
                    VALUE: 2,
                },
                func: (sprite, script) => {
                    const value = Math.round(_clamp(script.getNumberValue('VALUE'), 0, 9));
                    const x = Math.round(_clamp(script.getNumberValue('X'), 0, 4));
                    const y = Math.round(_clamp(script.getNumberValue('Y'), 0, 4));
                    const data = {
                        type: functionKeys.SET_LED,
                        data: {
                            x,
                            y,
                            value,
                        },
                    };

                    const parsedPayload = `${x};${y};${value}`;
                    this.requestCommandWithResponse(
                        script.entity.id,
                        functionKeys.SET_LED,
                        parsedPayload
                    );
                },
            },
            microbit2_get_led: {
                color: EntryStatic.colorSet.block.default.HARDWARE,
                outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
                fontColor: '#ffffff',
                skeleton: 'basic_string_field',
                statements: [],
                params: [
                    {
                        type: 'Block',
                        accept: 'string',
                        defaultType: 'number',
                    },
                    {
                        type: 'Block',
                        accept: 'string',
                        defaultType: 'number',
                    },
                ],
                events: {},
                class: 'microbit2Led',
                isNotFor: ['microbit2'],
                def: {
                    params: [
                        {
                            type: 'text',
                            params: ['0'],
                        },
                        {
                            type: 'text',
                            params: ['0'],
                        },
                    ],
                    type: 'microbit2_get_led',
                },
                paramsKeyMap: {
                    X: 0,
                    Y: 1,
                },
                func: (sprite, script) => {
                    const x = _clamp(script.getNumberValue('X'), 0, 4);
                    const y = _clamp(script.getNumberValue('Y'), 0, 4);
                    const parsedPayload = `${x};${y}`;
                    this.requestCommandWithResponse(
                        script.entity.id,
                        functionKeys.GET_LED,
                        parsedPayload
                    );

                    const parsedResponse = this.commandValue[
                        this.generateCodeId(script.entity.id, functionKeys.GET_LED, parsedPayload)
                    ].split(';');

                    delete this.commandValue[
                        this.generateCodeId(script.entity.id, functionKeys.GET_LED, parsedPayload)
                    ];

                    if (parsedResponse[1] == 0) {
                        return 0;
                    } else if (parsedResponse[1] == 1) {
                        return 1;
                    }

                    return Math.round(Math.log2(parsedResponse[1] * 2));
                },
            },
            microbit2_show_preset_image: {
                color: EntryStatic.colorSet.block.default.HARDWARE,
                outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
                fontColor: '#ffffff',
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Dropdown',
                        options: [
                            [Lang.Blocks.microbit_2_HEART, 0],
                            [Lang.Blocks.microbit_2_HEART_SMALL, 1],
                            [Lang.Blocks.microbit_2_HAPPY, 2],
                            [Lang.Blocks.microbit_2_SMILE, 3],
                            [Lang.Blocks.microbit_2_SAD, 4],
                            [Lang.Blocks.microbit_2_CONFUSED, 5],
                            [Lang.Blocks.microbit_2_ANGRY, 6],
                            [Lang.Blocks.microbit_2_ASLEEP, 7],
                            [Lang.Blocks.microbit_2_SURPRISED, 8],
                            [Lang.Blocks.microbit_2_SILLY, 9],
                            [Lang.Blocks.microbit_2_FABULOUS, 10],
                            [Lang.Blocks.microbit_2_MEH, 11],
                            [Lang.Blocks.microbit_2_YES, 12],
                            [Lang.Blocks.microbit_2_NO, 13],
                            [Lang.Blocks.microbit_2_CLOCK1, 14],
                            [Lang.Blocks.microbit_2_CLOCK2, 15],
                            [Lang.Blocks.microbit_2_CLOCK3, 16],
                            [Lang.Blocks.microbit_2_CLOCK4, 17],
                            [Lang.Blocks.microbit_2_CLOCK5, 18],
                            [Lang.Blocks.microbit_2_CLOCK6, 19],
                            [Lang.Blocks.microbit_2_CLOCK7, 20],
                            [Lang.Blocks.microbit_2_CLOCK8, 21],
                            [Lang.Blocks.microbit_2_CLOCK9, 22],
                            [Lang.Blocks.microbit_2_CLOCK10, 23],
                            [Lang.Blocks.microbit_2_CLOCK11, 24],
                            [Lang.Blocks.microbit_2_CLOCK12, 25],
                            [Lang.Blocks.microbit_2_ARROW_N, 26],
                            [Lang.Blocks.microbit_2_ARROW_NE, 27],
                            [Lang.Blocks.microbit_2_ARROW_E, 28],
                            [Lang.Blocks.microbit_2_ARROW_SE, 29],
                            [Lang.Blocks.microbit_2_ARROW_S, 30],
                            [Lang.Blocks.microbit_2_ARROW_SW, 31],
                            [Lang.Blocks.microbit_2_ARROW_W, 32],
                            [Lang.Blocks.microbit_2_ARROW_NW, 33],
                            [Lang.Blocks.microbit_2_TRIANGLE, 34],
                            [Lang.Blocks.microbit_2_TRIANGLE_LEFT, 35],
                            [Lang.Blocks.microbit_2_CHESSBOARD, 36],
                            [Lang.Blocks.microbit_2_DIAMOND, 37],
                            [Lang.Blocks.microbit_2_DIAMOND_SMALL, 38],
                            [Lang.Blocks.microbit_2_SQUARE, 39],
                            [Lang.Blocks.microbit_2_SQUARE_SMALL, 40],
                            [Lang.Blocks.microbit_2_RABBIT, 41],
                            [Lang.Blocks.microbit_2_COW, 42],
                            [Lang.Blocks.microbit_2_MUSIC_CROTCHET, 43],
                            [Lang.Blocks.microbit_2_MUSIC_QUAVER, 44],
                            [Lang.Blocks.microbit_2_MUSIC_QUAVERS, 45],
                            [Lang.Blocks.microbit_2_PITCHFORK, 46],
                            [Lang.Blocks.microbit_2_XMAS, 47],
                            [Lang.Blocks.microbit_2_PACMAN, 48],
                            [Lang.Blocks.microbit_2_TARGET, 49],
                            [Lang.Blocks.microbit_2_TSHIRT, 50],
                            [Lang.Blocks.microbit_2_ROLLERSKATE, 51],
                            [Lang.Blocks.microbit_2_DUCK, 52],
                            [Lang.Blocks.microbit_2_HOUSE, 53],
                            [Lang.Blocks.microbit_2_TORTOISE, 54],
                            [Lang.Blocks.microbit_2_BUTTERFLY, 55],
                            [Lang.Blocks.microbit_2_STICKFIGURE, 56],
                            [Lang.Blocks.microbit_2_GHOST, 57],
                            [Lang.Blocks.microbit_2_SWORD, 58],
                            [Lang.Blocks.microbit_2_GIRAFFE, 59],
                            [Lang.Blocks.microbit_2_SKULL, 60],
                            [Lang.Blocks.microbit_2_UMBRELLA, 61],
                            [Lang.Blocks.microbit_2_SNAKE, 62],
                        ],
                        value: 0,
                        fontSize: 11,
                        bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                        arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                    },
                    {
                        type: 'Indicator',
                        img: 'block_icon/hardware_icon.svg',
                        size: 12,
                    },
                ],
                events: {},
                class: 'microbit2Led',
                isNotFor: ['microbit2'],
                def: {
                    type: 'microbit2_show_preset_image',
                },
                paramsKeyMap: {
                    VALUE: 0,
                },
                func: (sprite, script) => {
                    const value = _clamp(script.getNumberValue('VALUE'), 0, 62);

                    const parsedPayload = `${value}`;
                    this.requestCommandWithResponse(
                        script.entity.id,
                        functionKeys.PRESET_IMAGE,
                        parsedPayload
                    );
                },
            },
            microbit2_show_custom_image: {
                color: EntryStatic.colorSet.block.default.HARDWARE,
                outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Led2',
                    },
                    {
                        type: 'Indicator',
                        img: 'block_icon/hardware_icon.svg',
                        size: 12,
                    },
                ],
                events: {},
                class: 'microbit2Led',
                isNotFor: ['microbit2'],
                def: {
                    type: 'microbit2_show_custom_image',
                },
                paramsKeyMap: {
                    VALUE: 0,
                },
                func: (sprite, script) => {
                    const value = script.getField('VALUE');
                    const processedValue = [];
                    for (const i in value) {
                        processedValue[i] = value[i].join();
                    }
                    const parsedPayload = `${processedValue.join(':').replace(/,/gi, '')}`;
                    this.requestCommandWithResponse(
                        script.entity.id,
                        functionKeys.SET_CUSTOM_IMAGE,
                        parsedPayload
                    );
                },
            },
            microbit2_show_full_brightness_custom_image: {
                color: EntryStatic.colorSet.block.default.HARDWARE,
                outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Led',
                        defaultStatus: [
                            [0, 0, 0, 0, 0],
                            [0, 1, 0, 1, 0],
                            [0, 0, 0, 0, 0],
                            [1, 0, 0, 0, 1],
                            [0, 1, 1, 1, 0],
                        ],
                        defaultValue: 9,
                    },
                    {
                        type: 'Indicator',
                        img: 'block_icon/hardware_icon.svg',
                        size: 12,
                    },
                ],
                events: {},
                class: 'microbit2Led',
                isNotFor: ['microbit2'],
                def: {
                    type: 'microbit2_show_full_brightness_custom_image',
                },
                paramsKeyMap: {
                    VALUE: 0,
                },
                func: (sprite, script) => {
                    const value = script.getField('VALUE');
                    const processedValue = [];
                    for (const i in value) {
                        processedValue[i] = value[i].join();
                    }
                    const parsedPayload = `${processedValue.join(':').replace(/,/gi, '')}`;
                    this.requestCommandWithResponse(
                        script.entity.id,
                        functionKeys.SET_CUSTOM_IMAGE,
                        parsedPayload
                    );
                },
            },
        };
    };
})();

module.exports = Entry.Microbit2;