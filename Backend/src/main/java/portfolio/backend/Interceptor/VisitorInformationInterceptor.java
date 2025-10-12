package portfolio.backend.Interceptor;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Arrays;
import java.util.UUID;

@Component
@Slf4j
public class VisitorInformationInterceptor implements HandlerInterceptor {

//    쿠키 이름 정의
    private static final String VISITOR_ID_COOKIE = "harim-dev-id"; //누구인지 알 수 있는 쿠키 (영구)
    private static final String VISIT_SESSION_COOKIE = "harim-dev-session"; // 임시 세션 쿠키, 몇번 째 방문인지 확인 가능
    private static final String VISIT_COUNT_COOKIE = "harim-dev-count"; //VisitorID에  해당하는 브라우저의 누적 방문 횟수 저장

    /**
     * 방문자의 정보를 출력하는 인터셉터 입니다.
     *
     * @param request current HTTP request
     * @param response current HTTP response
     * @param handler chosen handler to execute, for type and/or instance evaluation
     * @return true (접속 사이트 접속하도록)
     * @throws Exception
     */
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {

//        방문자의 IP 추적 (프록시 이전 IP 추적)
        String clientIp = getClientIp(request);
//        내 쿠키 정보 조회
        Cookie[] cookies = request.getCookies();

//        내 쿠키 찾기, 즉 이전에 방문했던 방문자인지 확인
        String visitorId = findCookieValue(cookies, VISITOR_ID_COOKIE);
//        브라우저 종료 이후 재방문인지 세션으로 확인
        String visitSession = findCookieValue(cookies, VISIT_SESSION_COOKIE);
//        어디 방문했는지 확인
        String requestURI = request.getRequestURI();

//        첫방문
        if (visitorId == null) {
            visitorId = UUID.randomUUID().toString();
            addCookie(response, VISITOR_ID_COOKIE, visitorId, 60 * 60 * 24 * 365);
        }

//        브라우저 종료로 인한 세션쿠키 삭제된 상태
        if (visitSession == null) {
            String visitCountStr = findCookieValue(cookies, VISIT_COUNT_COOKIE);
            int visitCount = (visitCountStr == null) ? 0 : Integer.parseInt(visitCountStr);
            visitCount++;

            String logMessage = String.format("[접속 #%-4s] New Session | IP: %-15s | Visitor: %-36s | URI: %s",
                    visitCount, clientIp, visitorId, requestURI);
            log.info(logMessage);

            addCookie(response, VISIT_COUNT_COOKIE, String.valueOf(visitCount), 60 * 60 * 24 * 365);
            addCookie(response, VISIT_SESSION_COOKIE, "active", -1);
        } else {
            String logMessage = String.format("탐색              | IP: %-15s | Visitor: %-36s | URI: %s",
                    clientIp, visitorId, requestURI);
            log.info(logMessage);
        }

        return true;
    }

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("CF-Connecting-IP");
        if (ip == null) { ip = request.getHeader("X-Forwarded-For"); }
        if (ip == null) { ip = request.getHeader("X-Real-IP"); }
        if (ip == null) { ip = request.getHeader("Proxy-Client-IP"); }
        if (ip == null) { ip = request.getHeader("WL-Proxy-Client-IP"); }
        if (ip == null) { ip = request.getHeader("HTTP_CLIENT_IP"); }
        if (ip == null) { ip = request.getHeader("HTTP_X_FORWARDED_FOR"); }
        if (ip == null) { ip = request.getRemoteAddr(); }
        if (ip != null && ip.contains(",")) { ip = ip.split(",")[0].trim(); }
        return ip;
    }

    private String findCookieValue(Cookie[] cookies, String cookieName) {
        if (cookies == null) { return null; }
        return Arrays.stream(cookies)
                .filter(c -> cookieName.equals(c.getName()))
                .findFirst()
                .map(cookie -> cookie.getValue())
                .orElse(null);
    }

    private void addCookie(HttpServletResponse response, String name, String value, int maxAge) {
        Cookie cookie = new Cookie(name, value);
        cookie.setPath("/");
        if (maxAge != -1) { cookie.setMaxAge(maxAge); }
        response.addCookie(cookie);
    }
}