package portfolio.backend.dto;


import lombok.Builder;
import lombok.Getter;
import portfolio.backend.service.Timeline.EducationC;
import portfolio.backend.service.Timeline.ExperienceC;

import java.util.List;

@Builder
@Getter
public class TimelineResponse {
    List<EducationC> educations;
    List<ExperienceC> experiences;
}
