import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
    drillSlug, shareUrl, drillFromUrl, shareText, smsHref, facebookHref, isLocalOnly,
} from '../public/js/share.js';
import { DRILLS } from '../public/js/drills.js';

test('shareUrl drops private query/hash and adds a drill id', () => {
    assert.equal(shareUrl('https://example.com/app/?debug#x'), 'https://example.com/app/');
    assert.equal(
        shareUrl('https://user.github.io/metal-riff-trainer/?drill=old', 'dm-slam-groove.alphatex'),
        'https://user.github.io/metal-riff-trainer/?drill=dm-slam-groove',
    );
});

test('drillFromUrl finds the drill from a shared link', () => {
    const d = drillFromUrl('https://example.com/?drill=dm-death-metal-gauntlet', DRILLS);
    assert.equal(d.title, 'Death Metal Gauntlet');
    assert.equal(drillFromUrl('https://example.com/?drill=GALLOP-DRILL.alphatex', DRILLS).title, 'Gallop Drill');
    assert.equal(drillFromUrl('https://example.com/?drill=nope', DRILLS), null);
    assert.equal(drillFromUrl('https://example.com/', DRILLS), null);
});

test('every drill round-trips through a share link', () => {
    for (const d of DRILLS) {
        assert.equal(drillFromUrl(shareUrl('https://example.com/', d.file), DRILLS), d);
        assert.match(drillSlug(d.file), /^[a-z0-9-]+$/, `${d.file} makes a clean link id`);
    }
});

test('text and Facebook links are encoded safely', () => {
    const url = 'https://example.com/?drill=dm-slam-groove';
    const text = shareText('Death \'n\' Roll & "Slam"');
    const sms = smsHref(text, url);
    assert.ok(sms.startsWith('sms:?&body='));
    assert.equal(decodeURIComponent(sms.slice('sms:?&body='.length)), `${text} ${url}`);
    assert.equal(facebookHref(url), 'https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fexample.com%2F%3Fdrill%3Ddm-slam-groove');
    assert.match(shareText(), /Metal Riff Trainer/);
});

test('isLocalOnly spots addresses other people can\'t open', () => {
    for (const u of ['http://localhost:5173/', 'http://127.0.0.1/', 'file:///C:/x/index.html', 'http://192.168.1.20:5173/', 'http://10.0.0.5/']) {
        assert.equal(isLocalOnly(u), true, u);
    }
    for (const u of ['https://user.github.io/metal-riff-trainer/', 'https://metal-riff-trainer.netlify.app/']) {
        assert.equal(isLocalOnly(u), false, u);
    }
});
