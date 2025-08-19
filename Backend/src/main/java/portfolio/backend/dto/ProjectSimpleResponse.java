package portfolio.backend.dto;

import lombok.Builder;
import lombok.Getter;
import portfolio.backend.entity.Project;

@Getter
@Builder
public class ProjectSimpleResponse {

    private Long id;
    private String title;
    private String category;
    private String imagePath; // 대표 이미지
    private boolean emphasized;

    public static ProjectSimpleResponse from(Project project) {
        return ProjectSimpleResponse.builder()
                .id(project.getId())
                .title(project.getTitle())
                .category(project.getCategory())
                .imagePath(project.getImagePath())
                .emphasized(project.isEmphasized())
                .build();
    }
}