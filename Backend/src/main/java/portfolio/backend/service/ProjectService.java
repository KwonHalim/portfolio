package portfolio.backend.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import portfolio.backend.dto.ProjectDetailResponse;
import portfolio.backend.dto.ProjectSimpleResponse;
import portfolio.backend.entity.Project;
import portfolio.backend.repository.ProjectRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ProjectService {

    private final ProjectRepository projectRepository;

    public List<ProjectSimpleResponse> getProjects(String category) {

        List<Project> projects;

        // 카테고리 유무에 따라 분기
        if (category != null && !category.equals("all")) {
            // category를 기준으로 모든 프로젝트 조회
            projects = projectRepository.findByCategory(category);
        } else {
            // 모든 프로젝트 조회
            projects = projectRepository.findAllByOrderByDisplayOrderAsc();
        }

        // 조회된 Project 리스트를 ProjectSimpleResponse 리스트로 변환하여 반환
        return projects.stream()
                .map(project -> portfolio.backend.dto.ProjectSimpleResponse.from(project))
                .collect(Collectors.toList());
    }

    public ProjectDetailResponse getProjectDetail(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("프로젝트를 찾을 수 없습니다."));
        return ProjectDetailResponse.from(project);
    }
}