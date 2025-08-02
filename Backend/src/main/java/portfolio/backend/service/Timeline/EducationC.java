package portfolio.backend.service.Timeline;

import lombok.Builder;
import lombok.Getter;
import portfolio.backend.entity.Education;

import java.time.LocalDate;

@Builder
@Getter
public class EducationC {
    String place;
    LocalDate startDate;
    LocalDate endDate;
    String simpleDescription;
    String detailDescription;
    String iconPath;

    public static EducationC from(Education education) {
        return EducationC.builder()
                .place(education.getInstitution())
                .startDate(education.getStartDate())
                .endDate(education.getEndDate())
                .detailDescription(education.getDetailDescription())
                .simpleDescription(education.getSimpleDescription())
                .iconPath(education.getIconPath())
                .build();
    }
}
