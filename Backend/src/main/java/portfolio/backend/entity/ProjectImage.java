package portfolio.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.lang.Nullable;

@Entity
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectImage extends BaseEntity{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String imagePath;

    @Column(nullable = false)
     private int displayOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id") // 외래 키
    private Project project;
}