// 초기 키워드 설정
const DEFAULT_KEYWORDS = [
    '정보보안',
    '정보보호', 
    'DN오토모티브',
    'DN솔루션즈',
    '물리보안',
    '출입통제'
];

// 키워드 관리 클래스
class KeywordManager {
    constructor() {
        this.keywords = this.loadKeywords();
        this.initializeKeywords();
        this.renderKeywords();
        this.loadSettings();
    }

    // localStorage에서 키워드 로드
    loadKeywords() {
        const saved = localStorage.getItem('newsClipperKeywords');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error('키워드 로드 중 오류:', e);
            }
        }
        return [...DEFAULT_KEYWORDS];
    }

    // 초기 키워드 설정 (첫 실행시에만)
    initializeKeywords() {
        if (!localStorage.getItem('newsClipperKeywords')) {
            this.saveKeywords();
        }
    }

    // localStorage에 키워드 저장
    saveKeywords() {
        localStorage.setItem('newsClipperKeywords', JSON.stringify(this.keywords));
        this.showAlert('키워드가 저장되었습니다.', 'success');
    }

    // 키워드 추가
    addKeyword(keyword) {
        const trimmed = keyword.trim();
        
        if (!trimmed) {
            this.showAlert('키워드를 입력해주세요.', 'error');
            return false;
        }

        if (trimmed.length > 50) {
            this.showAlert('키워드는 50자 이내로 입력해주세요.', 'error');
            return false;
        }

        if (this.keywords.includes(trimmed)) {
            this.showAlert('이미 존재하는 키워드입니다.', 'error');
            return false;
        }

        this.keywords.push(trimmed);
        this.saveKeywords();
        this.renderKeywords();
        document.getElementById('newKeyword').value = '';
        return true;
    }

    // 키워드 삭제
    removeKeyword(keyword) {
        const index = this.keywords.indexOf(keyword);
        if (index > -1) {
            this.keywords.splice(index, 1);
            this.saveKeywords();
            this.renderKeywords();
        }
    }

    // 키워드 목록 렌더링
    renderKeywords() {
        const container = document.getElementById('keywordTags');
        
        if (this.keywords.length === 0) {
            container.innerHTML = '<p style="color: #6b7280; font-style: italic;">등록된 키워드가 없습니다. 새 키워드를 추가해보세요.</p>';
            return;
        }

        container.innerHTML = this.keywords.map(keyword => `
            <div class="keyword-tag">
                <span>${this.escapeHtml(keyword)}</span>
                <button class="remove-btn" onclick="keywordManager.removeKeyword('${this.escapeHtml(keyword)}')" title="삭제">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    }

    // HTML 이스케이프
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // 알림 메시지 표시
    showAlert(message, type = 'success') {
        const container = document.getElementById('alertContainer');
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        container.appendChild(alert);
        
        setTimeout(() => {
            alert.remove();
        }, 3000);
    }

    // 설정 로드
    loadSettings() {
        const email = localStorage.getItem('newsClipperEmail');
        const time = localStorage.getItem('newsClipperTime');
        
        if (email) {
            document.getElementById('emailAddress').value = email;
        }
        
        if (time) {
            document.getElementById('sendTime').value = time;
        }
    }

    // 설정 저장
    saveSettings() {
        const email = document.getElementById('emailAddress').value.trim();
        const time = document.getElementById('sendTime').value;

        if (!email) {
            this.showAlert('이메일 주소를 입력해주세요.', 'error');
            return;
        }

        if (!this.validateEmail(email)) {
            this.showAlert('올바른 이메일 주소를 입력해주세요.', 'error');
            return;
        }

        localStorage.setItem('newsClipperEmail', email);
        localStorage.setItem('newsClipperTime', time);
        
        this.showAlert('설정이 저장되었습니다.', 'success');
    }

    // 이메일 유효성 검사
    validateEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    // 테스트 이메일 발송
    async testEmail() {
        const email = document.getElementById('emailAddress').value.trim();
        
        if (!email) {
            this.showAlert('이메일 주소를 먼저 입력해주세요.', 'error');
            return;
        }

        if (!this.validateEmail(email)) {
            this.showAlert('올바른 이메일 주소를 입력해주세요.', 'error');
            return;
        }

        // 테스트 뉴스 데이터 생성
        const testNews = this.generateTestNews();
        
        try {
            // 실제 환경에서는 API 호출로 이메일 발송
            this.showAlert('테스트 이메일이 발송되었습니다. (개발 환경에서는 시뮬레이션)', 'success');
            console.log('테스트 이메일 내용:', testNews);
        } catch (error) {
            this.showAlert('이메일 발송 중 오류가 발생했습니다.', 'error');
            console.error('이메일 발송 오류:', error);
        }
    }

    // 테스트 뉴스 데이터 생성
    generateTestNews() {
        return this.keywords.map(keyword => ({
            title: `${keyword} 관련 최신 뉴스`,
            summary: `${keyword}에 대한 중요한 업데이트와 동향을 다룬 뉴스입니다.`,
            url: `#`,
            category: keyword,
            publishedAt: new Date().toISOString()
        }));
    }

    // 뉴스 미리보기
    async previewNews() {
        const container = document.getElementById('newsPreview');
        
        // 로딩 표시
        container.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: #4f46e5;"></i>
                <p style="margin-top: 10px; color: #6b7280;">뉴스를 가져오는 중...</p>
            </div>
        `;

        try {
            // 실제 환경에서는 뉴스 API 호출
            await new Promise(resolve => setTimeout(resolve, 1500)); // 시뮬레이션
            
            const mockNews = this.generateMockNews();
            this.renderNewsPreview(mockNews);
            
        } catch (error) {
            container.innerHTML = `
                <div class="alert alert-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    뉴스를 가져오는 중 오류가 발생했습니다.
                </div>
            `;
        }
    }

    // 목 뉴스 데이터 생성
    generateMockNews() {
        const mockTitles = {
            '정보보안': [
                '2024년 사이버보안 위협 동향 분석',
                '새로운 랜섬웨어 변종 발견, 기업 주의 필요',
                'AI 기반 보안 솔루션 도입 확산'
            ],
            '정보보호': [
                '개인정보보호법 개정안 주요 내용 공개',
                'GDPR 준수를 위한 기업 대응 전략',
                '데이터 프라이버시 강화 방안 논의'
            ],
            'DN오토모티브': [
                'DN오토모티브, 전기차 부품 사업 확장',
                '친환경 자동차 기술 개발에 투자 확대',
                '글로벌 자동차 시장 진출 가속화'
            ],
            'DN솔루션즈': [
                'DN솔루션즈, 디지털 혁신 서비스 강화',
                'AI 솔루션 개발로 경쟁력 제고',
                '스마트팩토리 구축 프로젝트 수주'
            ],
            '물리보안': [
                '스마트 빌딩 물리보안 시스템 도입 확산',
                'CCTV AI 분석 기술 발전 현황',
                '출입통제 시스템 보안 강화 방안'
            ],
            '출입통제': [
                '생체인식 출입통제 시스템 도입 증가',
                'IoT 기반 스마트 도어락 보안 이슈',
                '무인 출입통제 시스템 기술 동향'
            ]
        };

        const news = [];
        
        this.keywords.forEach(keyword => {
            const titles = mockTitles[keyword] || [`${keyword} 관련 최신 뉴스`];
            const randomTitle = titles[Math.floor(Math.random() * titles.length)];
            
            news.push({
                title: randomTitle,
                summary: `${keyword}와 관련된 중요한 업데이트와 최신 동향을 다룬 뉴스입니다. 업계 전문가들의 분석과 향후 전망을 포함하고 있습니다.`,
                url: '#',
                category: keyword,
                publishedAt: new Date(Date.now() - Math.random() * 86400000).toISOString(),
                source: '뉴스 클리핑 서비스'
            });
        });

        return news.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    }

    // 뉴스 미리보기 렌더링
    renderNewsPreview(newsData) {
        const container = document.getElementById('newsPreview');
        
        if (newsData.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 20px; color: #6b7280;">
                    <i class="fas fa-newspaper" style="font-size: 2rem; margin-bottom: 10px;"></i>
                    <p>현재 수집된 뉴스가 없습니다.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div style="margin-bottom: 15px;">
                <small style="color: #6b7280;">
                    <i class="fas fa-clock"></i>
                    ${newsData.length}개의 뉴스 (${new Date().toLocaleString('ko-KR')} 기준)
                </small>
            </div>
            ${newsData.map(news => `
                <div class="news-item">
                    <div class="news-title">${this.escapeHtml(news.title)}</div>
                    <div class="news-summary">${this.escapeHtml(news.summary)}</div>
                    <div class="news-meta">
                        <span>
                            <i class="fas fa-tag"></i>
                            ${this.escapeHtml(news.category)}
                        </span>
                        <span>
                            <i class="fas fa-clock"></i>
                            ${new Date(news.publishedAt).toLocaleDateString('ko-KR')}
                        </span>
                    </div>
                </div>
            `).join('')}
        `;
    }
}

// 전역 변수
let keywordManager;

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    keywordManager = new KeywordManager();
    
    // Enter 키 이벤트 리스너
    document.getElementById('newKeyword').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addKeyword();
        }
    });
});

// 전역 함수들
function addKeyword() {
    const input = document.getElementById('newKeyword');
    keywordManager.addKeyword(input.value);
}

function saveSettings() {
    keywordManager.saveSettings();
}

function testEmail() {
    keywordManager.testEmail();
}

function previewNews() {
    keywordManager.previewNews();
}

// 뉴스 수집 시 동적 키워드 활용을 위한 API 함수
function getKeywordsForNewsCollection() {
    return keywordManager ? keywordManager.keywords : DEFAULT_KEYWORDS;
}

// 키워드 변경 이벤트 (다른 스크립트에서 구독 가능)
window.addEventListener('keywordsChanged', function(event) {
    console.log('키워드가 변경되었습니다:', event.detail.keywords);
});

// 키워드 변경 이벤트 발생 함수
function triggerKeywordsChanged() {
    const event = new CustomEvent('keywordsChanged', {
        detail: { keywords: keywordManager.keywords }
    });
    window.dispatchEvent(event);
}