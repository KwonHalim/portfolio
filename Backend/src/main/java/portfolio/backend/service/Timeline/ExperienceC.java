package portfolio.backend.service.Timeline;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Builder
@Getter
public class ExperienceC {
    String place;
    LocalDate startDate;
    LocalDate endDate;
    String simpleDescription;
    String detailDescription;
}
