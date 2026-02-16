import "../styles/footer.css";

export default function Footer() {
	return (
		<footer className="app-footer" role="contentinfo">
			<div className="app-footer__inner">
				<p className="app-footer__notice">
					본 페이지는 실서비스가 아닌 부트캠프 백엔드 프로젝트 결과물입니다.
				</p>
				<div className="app-footer__links">
					<a
						href="https://github.com/Fantasystar94/LineofDuty"
						target="_blank"
						rel="noreferrer"
					>
						백엔드 GitHub
					</a>
					<span className="app-footer__sep">|</span>
					<a
						href="https://github.com/Fantasystar94/Pentagon-frontend/tree/main/frontend"
						target="_blank"
						rel="noreferrer"
					>
						프론트 GitHub
					</a>
				</div>
			</div>
		</footer>
	);
}
