var net = require('net');
var through = require('through');

function chunks (count) {
	var bufs = [], len = 0;
	return through(function write (buf) {
		// console.log(buf, len);
		bufs.push(buf);
		len += buf.length;
		if (len > count) {
			var full = Buffer.concat(bufs);
			bufs = [];
			for (var i = 0; i < Math.floor(full.length/count)*count ; i += count) {
				this.queue(full.slice(i, i + count));
			}
			if (i < full.length) {
				bufs.push(full.slice(i));
			}
		}
	}, function end () {
		if (bufs.length) {
			this.queue(Buffer.concat(bufs));
		}
		this.queue(null);
	})
}

var s = net.createConnection({
	path: '/tmp/tessel.port'
}, function () {
	// process.stdin.pipe(s).pipe(process.stdout);

	var id = setInterval(function () {
		s.write('\n');
	}, 100);

	var chunker = chunks(128);
	s.pipe(chunker)
	.on('data', function (data) {
		data = data.toString();
		var r = /^root@(Tessel-[0-9A-F]+):/m;
		if (data.match(r)) {
			console.log(data.match(r), data.match(r)[1]);
			clearInterval(id);
			s.unpipe(chunker);

			s.write('echo "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDHDidzDw7y08eEJQgj3WUJobFrima7ao2nw+BGTJj6SKslerRLV429pIwXyv+ks/RBv2UjQ1SP/ovr7svCZ+lhx6dz0nsY6O99EG9Sq+6Qhwln0HmZSlZhb6aEBwzynd9CuKXHuhunm2I9TYQg1lDSJcV6AhRhrIm/mT8wiExW2EPuCazkRvR36WuvY4Q2pAV3eRKLcM9XCn7/iDooGMhiKoHDLpXhQG5vHNp927bY9r0Ifb9udfnQTSt//fkJZm9vUZqiRw8g0zJuxo6DqspfnDTjbIW/L4H6ZeN45ItstI7vFY0lUphIszdBqLHVlqL2WHzalhHyukLGP2a3OOOX tim@lain.local" >> /etc/dropbear/authorized_keys\n')

			setTimeout(function () {
				s.end();
			}, 2000);

			// process.exit();
		}
	});

	/*
	s.write('\n\n');
	setTimeout(function () {
		s.write('echo "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDHDidzDw7y08eEJQgj3WUJobFrima7ao2nw+BGTJj6SKslerRLV429pIwXyv+ks/RBv2UjQ1SP/ovr7svCZ+lhx6dz0nsY6O99EG9Sq+6Qhwln0HmZSlZhb6aEBwzynd9CuKXHuhunm2I9TYQg1lDSJcV6AhRhrIm/mT8wiExW2EPuCazkRvR36WuvY4Q2pAV3eRKLcM9XCn7/iDooGMhiKoHDLpXhQG5vHNp927bY9r0Ifb9udfnQTSt//fkJZm9vUZqiRw8g0zJuxo6DqspfnDTjbIW/L4H6ZeN45ItstI7vFY0lUphIszdBqLHVlqL2WHzalhHyukLGP2a3OOOX tim@lain.local" >> /etc/dropbear/authorized_keys\n')
		setTimeout(function () {
			s.close();
		}, 5000)
	}, 5000)
*/
})