package portfolio.backend.controller;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import portfolio.backend.dto.ApiResponse;
import portfolio.backend.dto.ProfileResponse;
import portfolio.backend.service.ProfileService;

@Slf4j // 로그를 위한 어노테이션 추가
@RestController
@RequestMapping("/api/about")
@RequiredArgsConstructor
public class ProfileController {
    private final ProfileService profileService;

    @GetMapping("/KwonHalim")
    public ApiResponse<ProfileResponse> about_page(HttpServletRequest request) {
        String clientIp = request.getHeader("CF-Connecting-IP");
        if (clientIp == null) {
            clientIp = request.getRemoteAddr();
        }

        log.info("API 요청 - 실제 클라이언트 IP: {}", clientIp);

        ProfileResponse profile = profileService.getProfilePageInfos();
        return ApiResponse.success(profile);
    }
}