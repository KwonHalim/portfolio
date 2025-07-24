package portfolio.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import portfolio.backend.entity.Experience;

@Repository
public interface ExperienceRepository extends JpaRepository<Experience, Long> {

} 