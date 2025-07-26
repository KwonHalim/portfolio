package portfolio.backend.dto;

import lombok.Builder;
import lombok.Getter;
import portfolio.backend.service.ProfileService;

import java.time.LocalDate;
import java.util.List;

@Builder
@Getter
public class ProfileResponse {
    String name;
    String email;
    String github_url;
    String github_username;
    String location;
    LocalDate birthday;
    String introduction;
    List<ProfileService.TechInfo> techInfos;
    String job_type;
    String title;
    String profile_path;
}