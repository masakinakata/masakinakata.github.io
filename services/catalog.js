/* =========================================================
   サービス解説ページのカタログ
   - キーはファイル名（services/<キー>.html）
   - questions.js の各問題の services: [...] から参照される
   ========================================================= */
const SERVICES = {
  "aurora-global-database": { name: "Amazon Aurora Global Database", category: "データベース", summary: "リージョンをまたいでストレージ層で高速に複製するマルチリージョン DB" },
  "rds-proxy": { name: "Amazon RDS Proxy", category: "データベース", summary: "DB 接続をプールして接続枯渇とフェイルオーバー時間を改善" },
  "transit-gateway": { name: "AWS Transit Gateway", category: "ネットワーク", summary: "多数の VPC とオンプレミスをつなぐリージョンのハブ" },
  "route53-resolver": { name: "Amazon Route 53 Resolver", category: "ネットワーク", summary: "インバウンド / アウトバウンドエンドポイントによるハイブリッド DNS" },
  "global-accelerator": { name: "AWS Global Accelerator", category: "ネットワーク", summary: "静的エニーキャスト IP と AWS グローバルネットワークで通信を高速化" },
  "scp": { name: "サービスコントロールポリシー（SCP）", category: "セキュリティ・ガバナンス", summary: "組織のアカウントに権限の上限（ガードレール）を設定" },
  "kms": { name: "AWS KMS", category: "セキュリティ・ガバナンス", summary: "暗号化キーの管理とキーポリシーによるアクセス制御" },
  "cloudtrail": { name: "AWS CloudTrail（組織の証跡）", category: "セキュリティ・ガバナンス", summary: "API アクティビティの記録と、組織全体のログの一元管理" },
  "iam-identity-center": { name: "AWS IAM Identity Center", category: "セキュリティ・ガバナンス", summary: "複数アカウントへの従業員のシングルサインオン" },
  "waf": { name: "AWS WAF とオリジン保護", category: "セキュリティ・ガバナンス", summary: "L7 攻撃のブロックと CloudFront オリジンへの直接アクセス防止" },
  "ec2-spot": { name: "Amazon EC2 スポットインスタンス", category: "コンピューティング", summary: "余剰キャパシティを最大 90% 割引で使う購入オプション" },
  "sqs": { name: "Amazon SQS", category: "アプリケーション統合", summary: "メッセージキューによる疎結合化とスパイク吸収" },
  "kinesis-data-streams": { name: "Amazon Kinesis Data Streams", category: "アプリケーション統合", summary: "順序保証・複数コンシューマー・リプレイ可能なストリーミング" },
  "fsx-windows": { name: "Amazon FSx for Windows File Server", category: "ストレージ", summary: "SMB・AD・NTFS ACL 対応のフルマネージド Windows ファイルサーバー" },
  "s3-intelligent-tiering": { name: "S3 Intelligent-Tiering", category: "ストレージ", summary: "アクセス状況に応じて自動で階層を移動するストレージクラス" },
  "aws-backup": { name: "AWS Backup", category: "ストレージ", summary: "バックアップの一元管理と Vault Lock による削除防止" },
  "session-manager": { name: "Systems Manager Session Manager", category: "管理・運用", summary: "インバウンドポート不要で IAM 制御されたサーバーアクセス" },
  "dms": { name: "AWS DMS とスキーマ変換", category: "移行", summary: "停止時間を抑えたデータベース移行（全ロード + CDC）" },
  "mgn": { name: "AWS Application Migration Service（MGN）", category: "移行", summary: "継続的レプリケーションによるサーバーのリホスト移行" },
  "datasync": { name: "AWS DataSync", category: "移行", summary: "大量ファイルのオンライン転送・同期" }
};
