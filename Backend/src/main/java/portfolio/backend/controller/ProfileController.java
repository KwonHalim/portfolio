package portfolio.backend.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
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
    public ApiResponse<ProfileResponse> about_page() {
        ProfileResponse profile = profileService.getProfilePageInfos();
        return ApiResponse.success(profile);
    }
}