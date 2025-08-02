package portfolio.backend.service.Timeline;

import lombok.Builder;
import lombok.Getter;
import portfolio.backend.entity.Experience;

import java.time.LocalDate;

@Builder
@Getter
public class ExperienceC {
    String place;
    LocalDate startDate;
    LocalDate endDate;
    String simpleDescription;
    String detailDescription;
    String iconPath;

    public static ExperienceC from(Experience experience) {
        return ExperienceC.builder()
                .place(experience.getCompany())
                .startDate(experience.getStartDate())
                .endDate(experience.getEndDate())
                .detailDescription(experience.getDetailDescription())
                .simpleDescription(experience.getSimpleDescription())
                .iconPath(experience.getIconPath())
                .build();
    }
}
