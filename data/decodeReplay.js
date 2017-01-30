function r(e) {
    if (e) {
        this.id = l(),
        this.mapWidth = e.map.width,
        this.mapHeight = e.map.height,
        this.usernames = e.sockets.map(function(e) {
            return e.gio_username
        }),
        this.cities = e.cities.slice(),
        this.cityArmies = e.cities.map(function(t) {
            return e.map.armyAt(t)
        }),
        this.generals = e.generals.slice(),
        this.mountains = [];
        for (var t = 0; t < e.map.size(); t++)
            e.map.tileAt(t) === u.TILE_MOUNTAIN && this.mountains.push(t);
        this.teams = e.teams || null,
        this.moves = [],
        this.afks = []
    }
}
function o(e) {
    return [e.index, e.start, e.end, e.is50 ? 1 : 0, e.turn]
}
function i(e) {
    return {
        index: e[0],
        start: e[1],
        end: e[2],
        is50: e[3],
        turn: e[4]
    }
}
function a(e) {
    return [e.index, e.turn]
}
function s(e) {
    return {
        index: e[0],
        turn: e[1]
    }
}

deserialize = function(e) {
    try {
        var t = JSON.parse(decompressFromUint8Array(new Uint8Array(e)))
    } catch (e) {
        return 'something fucked up';
    }
    if (t) {
        var n = new r
          , o = 0;
        n.version = t[o++];
        n.id = t[o++];
        n.mapWidth = t[o++];
        n.mapHeight = t[o++];
        n.usernames = t[o++];
        n.stars = t[o++];
        n.cities = t[o++];
        n.cityArmies = t[o++];
        n.generals = t[o++];
        n.mountains = t[o++];
        n.moves = t[o++].map(i);
        n.afks = t[o++].map(s);
        n.teams = t[o++];
        return n;
    }
}
decompressFromUint8Array = function(e) {
    if (null === e || void 0 === e) {
        return decompress(e);
    }
    for (var n = new Array(e.length / 2), r = 0, o = n.length; r < o; r++) {
        n[r] = 256 * e[2 * r] + e[2 * r + 1];
    }
    var a = [];
    return n.forEach(function(e) {
        a.push(String.fromCharCode(e))
    }),
    decompress(a.join(""))
}
decompress = function(e) {
    return null == e ? "" : "" == e ? null : _decompress(e.length, 32768, function(t) {
        return e.charCodeAt(t)
    })
}
_decompress = function(e, n, r) {
    var o, i, a, s, u, c, l, p, h = [], d = 4, f = 4, m = 3, v = "", y = [], g = {
        val: r(0),
        position: n,
        index: 1
    };
    for (i = 0; i < 3; i += 1)
        h[i] = i;
    for (s = 0,
    c = Math.pow(2, 2),
    l = 1; l != c; )
        u = g.val & g.position,
        g.position >>= 1,
        0 == g.position && (g.position = n,
        g.val = r(g.index++)),
        s |= (u > 0 ? 1 : 0) * l,
        l <<= 1;
    switch (o = s) {
    case 0:
        for (s = 0,
        c = Math.pow(2, 8),
        l = 1; l != c; )
            u = g.val & g.position,
            g.position >>= 1,
            0 == g.position && (g.position = n,
            g.val = r(g.index++)),
            s |= (u > 0 ? 1 : 0) * l,
            l <<= 1;
        p = String.fromCharCode(s);
        break;
    case 1:
        for (s = 0,
        c = Math.pow(2, 16),
        l = 1; l != c; )
            u = g.val & g.position,
            g.position >>= 1,
            0 == g.position && (g.position = n,
            g.val = r(g.index++)),
            s |= (u > 0 ? 1 : 0) * l,
            l <<= 1;
        p = String.fromCharCode(s);
        break;
    case 2:
        return ""
    }
    for (h[3] = p,
    a = p,
    y.push(p); ; ) {
        if (g.index > e)
            return "";
        for (s = 0,
        c = Math.pow(2, m),
        l = 1; l != c; )
            u = g.val & g.position,
            g.position >>= 1,
            0 == g.position && (g.position = n,
            g.val = r(g.index++)),
            s |= (u > 0 ? 1 : 0) * l,
            l <<= 1;
        switch (p = s) {
        case 0:
            for (s = 0,
            c = Math.pow(2, 8),
            l = 1; l != c; )
                u = g.val & g.position,
                g.position >>= 1,
                0 == g.position && (g.position = n,
                g.val = r(g.index++)),
                s |= (u > 0 ? 1 : 0) * l,
                l <<= 1;
            h[f++] = String.fromCharCode(s),
            p = f - 1,
            d--;
            break;
        case 1:
            for (s = 0,
            c = Math.pow(2, 16),
            l = 1; l != c; )
                u = g.val & g.position,
                g.position >>= 1,
                0 == g.position && (g.position = n,
                g.val = r(g.index++)),
                s |= (u > 0 ? 1 : 0) * l,
                l <<= 1;
            h[f++] = String.fromCharCode(s),
            p = f - 1,
            d--;
            break;
        case 2:
            return y.join("")
        }
        if (0 == d && (d = Math.pow(2, m),
        m++),
        h[p])
            v = h[p];
        else {
            if (p !== f)
                return null;
            v = a + a.charAt(0)
        }
        y.push(v),
        h[f++] = a + v.charAt(0),
        d--,
        a = v,
        0 == d && (d = Math.pow(2, m),
        m++)
    }
}

var fs = require('fs');
var request = require('request');

var data = [];

var urls = fs.readFileSync('urls.txt').toString().split('\n').map((val) => {
    return new Promise((resolve, reject) => {
        request({
            method: 'GET', url: 'http://www.generals.io/' + val + '.gior', encoding: null,
        }, (err, response, body) => {
            if (err) {
                process.stdout.write('\n' + err + '\n');
                return reject(err);
            }
            process.stdout.write('.');
            resolve(data.push(deserialize(response.body)));
        });
    });
})

Promise.all(urls).then(() => {
    process.stdout.write('\nAll URLs processed.\n');
    fs.writeFileSync('data.json', JSON.stringify(data));
});
