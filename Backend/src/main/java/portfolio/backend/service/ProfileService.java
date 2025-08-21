package portfolio.backend.service;

import jakarta.transaction.Transactional;
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
        // 1. 데이터 조회
        Profile profile = profileRepository.findByName("권하림");
        List<ProfileTechnology> techStacks = profileTechnologyRepository.findByProfileId(profile.getId());

        return ProfileResponse.of(profile, techStacks);
    }
}