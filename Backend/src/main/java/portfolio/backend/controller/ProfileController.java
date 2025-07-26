package portfolio.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import portfolio.backend.dto.ApiResponse;
import portfolio.backend.dto.ProfileResponse;
import portfolio.backend.service.ProfileService;

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