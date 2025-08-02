package portfolio.backend.service;

import jakarta.transaction.Transactional;
import lombok.Builder;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import portfolio.backend.dto.ProfileResponse;
import portfolio.backend.entity.Profile;
import portfolio.backend.entity.ProfileTechnology;
import portfolio.backend.repository.ProfileRepository;
import portfolio.backend.repository.ProfileTechnologyRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ProfileService {
    private final ProfileRepository profileRepository;
    private final ProfileTechnologyRepository profileTechnologyRepository;

    public Long getProfileNum() {
        Profile halim = profileRepository.findByName("권하림");
        return halim.getId();

    }


    public ProfileResponse getProfilePageInfos() {
        Profile profile = profileRepository.findByName("권하림");
        List<ProfileTechnology> techStacks = profileTechnologyRepository.findByProfileId(profile.getId());
        List<TechInfo> techInfos = techStacks.stream()
                .map(profileTechnology -> TechInfo.builder()
                        .stack(String.valueOf(profileTechnology.getTechnology().getName()))
                        .description(profileTechnology.getDescription())
                        .icon_path(profileTechnology.getTechnology().getIconPath())
                        .build())
                .toList();

        return ProfileResponse.builder()
                .name(profile.getName())
                .email(profile.getEmail())
                .github_url(profile.getGithubUrl())
                .introduction(profile.getAboutText())
                .job_type(profile.getJob())
                .location(profile.getLocation())
                .title(profile.getTitle())
                .birthday(profile.getBirthDate())
                .techInfos(techInfos)
                .github_username(profile.getGithubUsername())
                .profile_path(profile.getProfileImagePath())
                .build();
    }


    @Builder
    @Getter
    public static class TechInfo {
        String stack;
        String description;
        String icon_path;
    }
}
