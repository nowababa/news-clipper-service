const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const Parser = require('rss-parser');

class NewsClipper {
    constructor() {
        this.parser = new Parser();
        this.keywords = this.getKeywords();
        
        // SMTP 설정
        this.transporter = nodemailer.createTransporter({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: process.env.SMTP_PORT || 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }

    // 동적 키워드 로드 (기본값 사용)
    getKeywords() {
        // 실제 환경에서는 저장된 사용자 설정을 읽어와야 하지만,
        // GitHub Actions 환경에서는 기본 키워드 사용
        return [
            '정보보안',
            '정보보호',
            'DN오토모티브', 
            'DN솔루션즈',
            '물리보안',
            '출입통제'
        ];
    }

    // RSS 피드에서 뉴스 수집
    async collectNews() {
        const rssSources = [
            'https://feeds.feedburner.com/boannews', // 보안뉴스
            'https://rss.cnn.com/rss/edition.rss',   // CNN (영문)
            'https://feeds.yna.co.kr/it',            // 연합뉴스 IT
            'https://rss.donga.com/total.xml'        // 동아일보
        ];

        const allNews = [];
        
        for (const url of rssSources) {
            try {
                console.log(`Fetching news from: ${url}`);
                const feed = await this.parser.parseURL(url);
                
                feed.items.forEach(item => {
                    // 키워드 매칭 확인
                    const matchedKeywords = this.keywords.filter(keyword => 
                        item.title?.includes(keyword) || 
                        item.contentSnippet?.includes(keyword) ||
                        item.content?.includes(keyword)
                    );

                    if (matchedKeywords.length > 0) {
                        allNews.push({
                            title: item.title,
                            summary: this.extractSummary(item.contentSnippet || item.content || ''),
                            url: item.link,
                            publishedAt: item.pubDate || new Date().toISOString(),
                            categories: matchedKeywords,
                            source: this.extractSourceName(url)
                        });
                    }
                });
                
                // API 호출 간격 조절
                await new Promise(resolve => setTimeout(resolve, 1000));
                
            } catch (error) {
                console.error(`Error fetching from ${url}:`, error.message);
            }
        }

        // 중복 제거 및 정렬
        const uniqueNews = this.removeDuplicates(allNews);
        return uniqueNews
            .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
            .slice(0, 20); // 최대 20개
    }

    // 요약문 추출
    extractSummary(content) {
        if (!content) return '';
        
        // HTML 태그 제거
        const cleanContent = content.replace(/<[^>]*>/g, '').trim();
        
        // 150자로 제한
        return cleanContent.length > 150 
            ? cleanContent.substring(0, 147) + '...'
            : cleanContent;
    }

    // 소스명 추출
    extractSourceName(url) {
        try {
            const domain = new URL(url).hostname;
            const sourceNames = {
                'feeds.feedburner.com': '보안뉴스',
                'rss.cnn.com': 'CNN',
                'feeds.yna.co.kr': '연합뉴스',
                'rss.donga.com': '동아일보'
            };
            return sourceNames[domain] || domain;
        } catch {
            return '뉴스 소스';
        }
    }

    // 중복 뉴스 제거
    removeDuplicates(news) {
        const seen = new Set();
        return news.filter(item => {
            const key = item.title.toLowerCase().replace(/\s+/g, '');
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    }

    // HTML 이메일 템플릿 생성
    generateEmailHTML(newsData) {
        const today = new Date().toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long', 
            day: 'numeric',
            weekday: 'long'
        });

        const newsByCategory = {};
        newsData.forEach(news => {
            news.categories.forEach(category => {
                if (!newsByCategory[category]) {
                    newsByCategory[category] = [];
                }
                newsByCategory[category].push(news);
            });
        });

        return `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>뉴스 클리핑 - ${today}</title>
    <style>
        body { font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #4f46e5, #7c3aed); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .header p { margin: 10px 0 0; opacity: 0.9; }
        .content { padding: 30px; }
        .category { margin-bottom: 30px; }
        .category h2 { color: #4f46e5; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 15px; }
        .news-item { border: 1px solid #e5e7eb; border-radius: 6px; padding: 20px; margin-bottom: 15px; }
        .news-title { font-weight: 600; color: #1f2937; margin-bottom: 8px; line-height: 1.4; }
        .news-summary { color: #6b7280; font-size: 14px; line-height: 1.5; margin-bottom: 10px; }
        .news-meta { display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: #9ca3af; }
        .news-link { color: #4f46e5; text-decoration: none; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📰 뉴스 클리핑</h1>
            <p>${today}</p>
        </div>
        <div class="content">
            ${Object.keys(newsByCategory).map(category => `
                <div class="category">
                    <h2>${category}</h2>
                    ${newsByCategory[category].slice(0, 5).map(news => `
                        <div class="news-item">
                            <div class="news-title">${news.title}</div>
                            <div class="news-summary">${news.summary}</div>
                            <div class="news-meta">
                                <span>${news.source}</span>
                                <a href="${news.url}" class="news-link" target="_blank">원문 보기</a>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `).join('')}
            
            ${newsData.length === 0 ? `
                <div style="text-align: center; padding: 40px; color: #6b7280;">
                    <p>오늘은 관심 키워드와 관련된 뉴스가 없습니다.</p>
                    <p>내일 다시 확인해보세요! 😊</p>
                </div>
            ` : ''}
        </div>
        <div class="footer">
            <p>이 메일은 자동화 뉴스 클리핑 서비스에서 발송되었습니다.</p>
            <p>키워드: ${this.keywords.join(', ')}</p>
        </div>
    </div>
</body>
</html>`;
    }

    // 이메일 발송
    async sendEmail(newsData) {
        const toEmail = process.env.TO_EMAIL;
        
        if (!toEmail) {
            throw new Error('TO_EMAIL 환경변수가 설정되지 않았습니다.');
        }

        const today = new Date().toLocaleDateString('ko-KR');
        const subject = `📰 뉴스 클리핑 - ${today} (${newsData.length}건)`;
        const html = this.generateEmailHTML(newsData);

        const mailOptions = {
            from: process.env.SMTP_USER,
            to: toEmail,
            subject: subject,
            html: html
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log(`이메일 발송 완료: ${toEmail}`);
            return true;
        } catch (error) {
            console.error('이메일 발송 실패:', error);
            return false;
        }
    }

    // 메인 실행 함수
    async run() {
        try {
            console.log('뉴스 클리핑 서비스 시작...');
            console.log('키워드:', this.keywords.join(', '));
            
            // 뉴스 수집
            const news = await this.collectNews();
            console.log(`${news.length}개의 뉴스를 수집했습니다.`);
            
            // 이메일 발송
            const success = await this.sendEmail(news);
            
            if (success) {
                console.log('뉴스 클리핑이 성공적으로 완료되었습니다.');
            } else {
                console.error('이메일 발송에 실패했습니다.');
            }
            
        } catch (error) {
            console.error('뉴스 클리핑 실행 중 오류:', error);
            process.exit(1);
        }
    }
}

// 실행
if (require.main === module) {
    const clipper = new NewsClipper();
    clipper.run();
}

module.exports = NewsClipper;