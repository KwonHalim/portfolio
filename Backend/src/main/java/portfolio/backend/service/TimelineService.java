package portfolio.backend.service;


import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import portfolio.backend.dto.TimelineResponse;
import portfolio.backend.entity.Education;
import portfolio.backend.entity.Experience;
import portfolio.backend.repository.EducationRepository;
import portfolio.backend.repository.ExperienceRepository;
import portfolio.backend.service.Timeline.EducationC;
import portfolio.backend.service.Timeline.ExperienceC;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class TimelineService {
    private final EducationRepository educationRepository;
    private final ExperienceRepository experienceRepository;
    private final ProfileService profileService;

    public TimelineResponse timeLinePage() {
        return TimelineResponse.builder()
                .experiences(findExperienceList())
                .educations(findEducationList())
                .build();
    }


    List<EducationC> findEducationList() {
        List<Education> educations = educationRepository.findByProfileId(profileService.getProfileNum());
        return educations.stream()
                .map(Education -> EducationC.builder()
                        .place(Education.getInstitution())
                        .startDate(Education.getStartDate())
                        .endDate(Education.getEndDate())
                        .detailDescription(Education.getDetailDescription())
                        .simpleDescription(Education.getSimpleDescription())
                        .build()).toList();


    }

    List<ExperienceC> findExperienceList() {
        List<Experience> experiences = experienceRepository.findByProfileId(profileService.getProfileNum());
        return experiences.stream()
                .map(experience -> ExperienceC.builder()
                        .place(experience.getCompany())
                        .detailDescription(experience.getDetailDescription())
                        .simpleDescription(experience.getSimpleDescription())
                        .startDate(experience.getStartDate())
                        .endDate(experience.getEndDate())
                        .build()).toList();
    }
}