import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
    parseYouTubeId, parseStartTime, formatTime, parseTime, validateRiff, playerErrorMessage,
} from '../public/js/youtube.js';

const ID = 'M7lc1UVf-VE';

test('parseYouTubeId handles every common link shape', () => {
    const links = [
        `https://www.youtube.com/watch?v=${ID}`,
        `https://youtube.com/watch?v=${ID}&t=42s`,
        `https://www.youtube.com/watch?feature=share&v=${ID}&list=PL123`,
        `https://m.youtube.com/watch?v=${ID}`,
        `https://music.youtube.com/watch?v=${ID}`,
        `https://youtu.be/${ID}`,
        `https://youtu.be/${ID}?si=abcdef&t=10`,
        `https://www.youtube.com/shorts/${ID}`,
        `https://www.youtube.com/embed/${ID}?start=5`,
        `https://www.youtube-nocookie.com/embed/${ID}`,
        `https://www.youtube.com/live/${ID}`,
        `youtube.com/watch?v=${ID}`,
        `youtu.be/${ID}`,
        `  https://youtu.be/${ID}  `,
        ID,
    ];
    for (const link of links) assert.equal(parseYouTubeId(link), ID, link);
});

test('parseYouTubeId reads the first URL of a dragged uri-list', () => {
    assert.equal(parseYouTubeId(`# comment\r\nhttps://youtu.be/${ID}\r\nhttps://example.com`), ID);
});

test('parseYouTubeId rejects non-YouTube and malformed input', () => {
    for (const bad of [
        '', null, undefined, 'hello world', 'https://example.com/watch?v=' + ID,
        'https://www.youtube.com/watch?v=short', 'https://www.youtube.com/channel/UC123',
        'https://www.youtube.com/', 'https://evil-youtube.com/watch?v=' + ID,
    ]) {
        assert.equal(parseYouTubeId(bad), null, String(bad));
    }
});

test('parseStartTime understands t= and start= forms', () => {
    assert.equal(parseStartTime(`https://youtu.be/${ID}?t=83`), 83);
    assert.equal(parseStartTime(`https://www.youtube.com/watch?v=${ID}&t=1m23s`), 83);
    assert.equal(parseStartTime(`https://www.youtube.com/watch?v=${ID}&t=1h2m3s`), 3723);
    assert.equal(parseStartTime(`https://www.youtube.com/embed/${ID}?start=12`), 12);
    assert.equal(parseStartTime(`https://youtu.be/${ID}`), null);
    assert.equal(parseStartTime(`https://youtu.be/${ID}?t=abc`), null);
});

test('formatTime and parseTime round-trip', () => {
    assert.equal(formatTime(0), '0:00.0');
    assert.equal(formatTime(83.46), '1:23.5');
    assert.equal(formatTime(59.96), '1:00.0');
    assert.equal(formatTime(3723.2), '1:02:03.2');
    for (const s of [0, 5.5, 83.4, 600, 3723.2]) assert.equal(parseTime(formatTime(s)), s);
    assert.equal(parseTime('83'), 83);
    assert.equal(parseTime('1:23'), 83);
    assert.equal(parseTime(' 0:05.25 '), 5.25);
    assert.equal(parseTime('1:75'), null);
    assert.equal(parseTime('abc'), null);
    assert.equal(parseTime(''), null);
    assert.equal(parseTime('-5'), null);
});

test('validateRiff catches bad ranges', () => {
    assert.equal(validateRiff(10, 20, 300), null);
    assert.match(validateRiff(null, 20, 300), /both/);
    assert.match(validateRiff(20, 20.2, 300), /half a second/);
    assert.match(validateRiff(20, 10, 300), /half a second/);
    assert.match(validateRiff(290, 320, 300), /only 5:00.0 long/);
    assert.equal(validateRiff(10, 20, 0), null, 'unknown duration is allowed');
});

test('playerErrorMessage explains embed restrictions', () => {
    assert.match(playerErrorMessage(150), /doesn't allow/);
    assert.match(playerErrorMessage(101), /doesn't allow/);
    assert.match(playerErrorMessage(100), /removed or is private/);
    assert.match(playerErrorMessage(999), /error 999/);
});
