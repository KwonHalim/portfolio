package portfolio.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import portfolio.backend.entity.ProjectImage;

@Repository
public interface ProjectImageRepository extends JpaRepository<ProjectImage, Long> {
}
