package portfolio.backend.dto;

import lombok.Builder;
import lombok.Getter;
import portfolio.backend.entity.Profile;
import portfolio.backend.entity.ProfileTechnology;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Builder
@Getter
public class ProfileResponse {
    private final String name;
    private final String email;
    private final String github_url;
    private final String github_username;
    private final String location;
    private final LocalDate birthday;
    private final String introduction;
    private final List<TechInfo> techInfos;
    private final String job_type;
    private final String title;
    private final String profile_path;

    // 1. 서비스에 있던 TechInfo를 내부 DTO로 이동
    @Builder
    @Getter
    public static class TechInfo {
        private final String stack;
        private final String description;
        private final String icon_path;
        private final String type;

        // ProfileTechnology 엔티티로부터 TechInfo DTO를 생성
        public static TechInfo from(ProfileTechnology profileTechnology) {
            return TechInfo.builder()
                    .stack(profileTechnology.getTechnology().getName())
                    .description(profileTechnology.getDescription())
                    .icon_path(profileTechnology.getTechnology().getIconPath())
                    .type(profileTechnology.getTechnology().getDescription())
                    .build();
        }
    }

    // 2. Profile과 기술 스택 리스트를 받아 ProfileResponse를 생성하는 주 DTO
    // (여러 재료를 조합하므로 of 사용)
    public static ProfileResponse of(Profile profile, List<ProfileTechnology> techStacks) {
        // 기술 스택 리스트 변환
        List<TechInfo> techInfos = techStacks.stream()
                .map(TechInfo::from) // .map(pt -> TechInfo.from(pt))
                .collect(Collectors.toList());

        // 최종 ProfileResponse 생성
        return ProfileResponse.builder()
                .name(profile.getName())
                .email(profile.getEmail())
                .github_url(profile.getGithubUrl())
                .introduction(profile.getAboutText())
                .job_type(profile.getJob())
                .location(profile.getLocation())
                .title(profile.getTitle())
                .birthday(profile.getBirthDate())
                .github_username(profile.getGithubUsername())
                .profile_path(profile.getProfileImagePath())
                .techInfos(techInfos)
                .build();
    }
}