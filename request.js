/* "다른지역 신청하기" 버튼 + 팝업. 모든 페이지에서 이 파일 하나만 불러오면 됩니다. */
(function () {
	// Airtable 빌더 허브(airtable.com/create/tokens)에서 만든 토큰을 아래 따옴표 안에 넣으세요.
	// 권한은 data.records:write 하나만, 접근 범위는 "여행 블로그" 베이스 하나만 주세요. (이 값은 공개됩니다)
	var AIRTABLE_TOKEN = '';
	var ENDPOINT = 'https://api.airtable.com/v0/appY7zis1HtXU6P4J/tblQzC8Ni5V0lwSBm';

	var nav = document.querySelector('.site-header nav');
	if (!nav) return;

	var btn = document.createElement('button');
	btn.type = 'button';
	btn.className = 'request-btn';
	btn.textContent = '다른지역 신청하기';
	nav.appendChild(btn);

	var dlg = document.createElement('dialog');
	dlg.className = 'request-dialog';
	dlg.innerHTML =
		'<form method="dialog" class="request-form" novalidate>' +
			'<div class="request-head"><h2>다른 지역 글 신청하기</h2>' +
			'<button type="button" class="request-close" aria-label="닫기">×</button></div>' +
			'<p class="muted">가보고 싶은 지역을 알려 주시면 조사해서 글로 정리할게요. 로그인은 필요 없어요.</p>' +
			'<label>닉네임<input name="nickname" maxlength="30" required autocomplete="nickname"></label>' +
			'<label>이메일<input name="email" type="email" maxlength="100" required autocomplete="email"></label>' +
			'<label>지역 이름<input name="region" maxlength="50" required placeholder="예: 제주 애월, 강릉"></label>' +
			'<label>내용 (어떤 글을 원하세요?)<textarea name="message" rows="4" maxlength="1000" required placeholder="예: 1박 2일 카페 위주 코스가 궁금해요"></textarea></label>' +
			'<input name="website" tabindex="-1" autocomplete="off" class="request-hp" aria-hidden="true">' +
			'<p class="request-status" role="status"></p>' +
			'<button type="submit" class="request-submit">신청하기</button>' +
		'</form>';
	document.body.appendChild(dlg);

	var form = dlg.querySelector('form');
	var status = dlg.querySelector('.request-status');
	var submit = dlg.querySelector('.request-submit');

	function setStatus(msg, bad) {
		status.textContent = msg;
		status.className = 'request-status' + (bad ? ' bad' : '');
	}

	btn.addEventListener('click', function () {
		setStatus('');
		dlg.showModal();
	});
	dlg.querySelector('.request-close').addEventListener('click', function () { dlg.close(); });
	// 바깥(어두운 배경) 클릭 시 닫기
	dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });

	form.addEventListener('submit', function (e) {
		e.preventDefault();
		var d = {};
		['nickname', 'email', 'region', 'message', 'website'].forEach(function (k) {
			d[k] = form.elements[k].value.trim();
		});
		if (d.website) { dlg.close(); return; } // 봇이 채우는 숨은 칸
		if (!d.nickname || !d.email || !d.region || !d.message) { setStatus('모든 칸을 입력해 주세요.', true); return; }
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) { setStatus('이메일 형식을 확인해 주세요.', true); return; }
		if (!AIRTABLE_TOKEN) { setStatus('신청 접수 기능이 아직 연결되지 않았어요.', true); return; }

		submit.disabled = true;
		setStatus('보내는 중…');
		fetch(ENDPOINT, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + AIRTABLE_TOKEN },
			body: JSON.stringify({
				fields: { '닉네임': d.nickname, '이메일': d.email, '지역 이름': d.region, '내용': d.message, '처리 상태': '접수' },
				typecast: true
			})
		}).then(function (r) {
			if (!r.ok) throw new Error(r.status);
			setStatus('신청이 접수됐어요. 감사합니다!');
			form.reset();
			setTimeout(function () { dlg.close(); }, 1800);
		}).catch(function () {
			setStatus('전송에 실패했어요. 잠시 후 다시 시도해 주세요.', true);
		}).then(function () { submit.disabled = false; });
	});
})();
